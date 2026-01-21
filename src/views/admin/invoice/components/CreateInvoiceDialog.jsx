import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CaretSortIcon, MobileIcon, PlusIcon } from '@radix-ui/react-icons'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckIcon, Mail, MapPin, Pencil, Plus, X, Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getCustomers } from '@/stores/CustomerSlice'
import UpdateCustomerDialog from '../../customer/components/UpdateCustomerDialog'
import CreateCustomerDialog from '../../customer/components/CreateCustomerDialog'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import MultipleSelector from '@/components/custom/MultiSelector'
import { attributes, productTypeMap } from '../data'
import { createInvoiceSchema } from '../schema'
import { getSetting } from '@/stores/SettingSlice'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getUsers } from '@/stores/UserSlice'
import {
  IconCircleX,
  IconDatabasePlus,
  IconFileTypePdf,
  IconPencil,
  IconReceipt2,
  IconUserShare,
} from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { createInvoice } from '@/stores/InvoiceSlice'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { paymentMethods } from '../../receipt/data'
import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'
import PrintInvoiceView from './PrintInvoiceView'
import CreateOtherExpenses from './CreateOtherExpenses'
import { dateFormat } from '@/utils/date-format'
import { DatePicker } from '@/components/custom/DatePicker'
import { getExpiriesByCustomerId } from '@/stores/ExpirySlice'


import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'

import CreateProductDialog from '../../product/components/CreateProductDialog'
import Can from '@/utils/can'
import { getSettingApi } from '@/api/setting'
import CategorySidebar from './CategorySidebar'
import ProductGrid from './ProductGrid'
import ShoppingCart from './ShoppingCart'
import InvoiceSidebar from './InvoiceSidebar'

const CreateInvoiceDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  const customers = useSelector((state) => state.customer.customers)
  const loading = useSelector((state) => state.invoice.loading)
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [productStartDate, setProductStartDate] = useState({})
  const [hasPrintQuotation, setHasPrintQuotation] = useState(false)
  const [applyWarrantyItems, setApplyWarrantyItems] = useState({})
  const [showQuotationPreview, setShowQuotationPreview] = useState(false)
  const [quotationData, setQuotationData] = useState(null)
  const [quotationFileName, setQuotationFileName] = useState('quotation.pdf')
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false)
  const [applyExpiryItems, setApplyExpiryItems] = useState({})
  const [expiryDurations, setExpiryDurations] = useState({})
  const [hasPrintInvoice, setHasPrintInvoice] = useState(false)
  const [showUpdateCustomerDialog, setShowUpdateCustomerDialog] =
    useState(false)
  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)

  const [selectedProducts, setSelectedProducts] = useState([])

  // ====== UNIT CONVERSION STATES ======
  // unitId khách chọn theo từng sản phẩm
  const [selectedUnitIds, setSelectedUnitIds] = useState({})
  // giá gốc theo baseUnit (giữ nguyên, không mutate product.price)
  const [baseUnitPrices, setBaseUnitPrices] = useState({})
  // giá override theo đơn vị đang chọn (nếu user sửa giá)
  const [priceOverrides, setPriceOverrides] = useState({})

  const sharingRatios = useSelector((state) => state.setting.setting)
  const users = useSelector((state) => state.user.users)
  const [isSharing, setIsSharing] = useState(false)
  const [isCreateReceipt, setIsCreateReceipt] = useState(false)
  const handleCreateReceipt = () => {
    setIsCreateReceipt((prev) => !prev)
  }

  const [showCreateOtherExpensesDialog, setShowCreateOtherExpensesDialog] =
    useState(false)
  const [otherExpenses, setOtherExpenses] = useState({
    price: 0,
    description: 'Phí vận chuyển',
  })

  const [discounts, setDiscounts] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState({})
  const [giveaway, setGiveaway] = useState({})
  const [accountName, setAccountName] = useState({})
  const [totalAmount, setTotalAmount] = useState('')
  const [selectedTaxes, setSelectedTaxes] = useState({})
  const [customerAccounts, setCustomerAccounts] = useState([])
  const [generalInformation, setGeneralInformation] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [banks, setBanks] = useState([])

  const handleStartDateChange = (productId, date) => {
    setProductStartDate((prev) => ({ ...prev, [productId]: date }))
  }

  useEffect(() => {
    dispatch(getProducts())
    dispatch(getCustomers())
    dispatch(getSetting('sharing_ratio'))
    dispatch(getUsers())
  }, [dispatch])

  useEffect(() => {
    if (!open) return

    const fetchSetting = async () => {
      const { payload: data } = await getSettingApi('general_information')
      if (!data) return

      setGeneralInformation(data)
      setBanks(data?.banks || [])
    }

    fetchSetting()
  }, [open])

  // optional: reset conversion states when dialog closes
  useEffect(() => {
    if (open) return
    setSelectedProducts([])
    setSelectedUnitIds({})
    setBaseUnitPrices({})
    setPriceOverrides({})
    setDiscounts({})
    setQuantities({})
    setNotes({})
    setGiveaway({})
    setSelectedTaxes({})
    setApplyWarrantyItems({})
    setApplyExpiryItems({})
    setExpiryDurations({})
    setProductStartDate({})
    setAccountName({})
    setCustomerAccounts([])
    setSelectedCustomer(null)
    setTotalAmount('')
    setIsSharing(false)
    setIsCreateReceipt(false)
    setHasPrintQuotation(false)
    setHasPrintInvoice(false)
  }, [open])

  const form = useForm({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      schoolId: '',
      customerId: '',
      status: 'pending',
      note: '',
      revenueSharing: null,
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
      orderDate: null,
    },
  })

  // ====== NEW: CATEGORY FILTERING ======
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // =========================
  // UNIT CONVERSION HELPERS
  // =========================
  const getBaseUnitId = (product) =>
    product?.baseUnitId || product?.prices?.[0]?.unitId || null

  const getBaseUnitName = (product) =>
    product?.baseUnit?.name || product?.prices?.[0]?.unitName || '—'

  const getUnitOptions = useCallback((product) => {
    const baseId = getBaseUnitId(product)
    const baseName = getBaseUnitName(product)

    const options = []

    if (baseId) {
      options.push({ unitId: Number(baseId), unitName: baseName, factor: 1 })
    }

    const conversions = Array.isArray(product?.unitConversions)
      ? product.unitConversions
      : []

    for (const c of conversions) {
      const uId = Number(c?.unitId)
      if (!uId) continue
      const factor = Number(c?.conversionFactor || 0)
      options.push({
        unitId: uId,
        unitName: c?.unit?.name || '—',
        factor: factor > 0 ? factor : 1,
      })
    }

    // unique by unitId
    const map = new Map()
    for (const o of options) {
      if (!map.has(o.unitId)) map.set(o.unitId, o)
    }
    return Array.from(map.values())
  }, [])

  const getFactor = useCallback(
    (product, unitId) => {
      const uId = Number(unitId)
      if (!uId) return 1
      const opt = getUnitOptions(product).find((o) => Number(o.unitId) === uId)
      return opt?.factor && opt.factor > 0 ? opt.factor : 1
    },
    [getUnitOptions],
  )

  const getUnitNameById = useCallback(
    (product, unitId) => {
      const uId = Number(unitId)
      const opt = getUnitOptions(product).find((o) => Number(o.unitId) === uId)
      return opt?.unitName || getBaseUnitName(product)
    },
    [getUnitOptions],
  )

  const getDisplayPrice = useCallback(
    (product) => {
      const pid = product?.id
      if (!pid) return 0

      const unitId =
        selectedUnitIds[pid] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const factor = getFactor(product, unitId)

      // ưu tiên override theo unit
      if (priceOverrides[pid] != null) return Number(priceOverrides[pid] || 0)

      const basePrice = Number(baseUnitPrices[pid] ?? product?.price ?? 0)
      return factor > 0 ? basePrice / factor : basePrice
    },
    [baseUnitPrices, priceOverrides, selectedUnitIds, getFactor, getBaseUnitId],
  )

  // ====== CATEGORY EXTRACTION ======
  const categories = useMemo(() => {
    if (!products || products.length === 0) return []

    const categoryMap = new Map()

    products.forEach(product => {
      const categoryId = product.categoryId || 'uncategorized'
      const categoryName = product.category?.name || 'Chưa phân loại'

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          icon: product.category?.icon,
          count: 0
        })
      }

      const category = categoryMap.get(categoryId)
      category.count++
    })

    return Array.from(categoryMap.values())
  }, [products])

  const productCounts = useMemo(() => {
    const counts = {}
    products.forEach(product => {
      const categoryId = product.categoryId || 'uncategorized'
      counts[categoryId] = (counts[categoryId] || 0) + 1
    })
    return counts
  }, [products])

  // ====== PRODUCT FILTERING ======
  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => (p.categoryId || 'uncategorized') === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, products, searchQuery])

  // ====== PRODUCT SELECTION HANDLERS ======
  const handleAddProduct = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id)

    if (isAlreadySelected) {
      // Remove from cart
      const newSelectedProducts = selectedProducts.filter(p => p.id !== product.id)
      setSelectedProducts(newSelectedProducts)

      // Cleanup states
      setSelectedUnitIds(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setBaseUnitPrices(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setPriceOverrides(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
    } else {
      // Add to cart
      handleSelectProduct([
        ...selectedProducts.map(p => ({ value: p.id, label: p.name })),
        { value: product.id, label: product.name }
      ])
    }
  }

  const handleRemoveProduct = (productId) => {
    const newSelectedProducts = selectedProducts.filter(p => p.id !== productId)
    setSelectedProducts(newSelectedProducts)

    // Cleanup all related states
    setSelectedUnitIds(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setBaseUnitPrices(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setPriceOverrides(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setDiscounts(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setQuantities(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setNotes(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setGiveaway(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setSelectedTaxes(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const handleUnitChange = (productId, unitId) => {
    setSelectedUnitIds(prev => ({ ...prev, [productId]: Number(unitId) }))
    setPriceOverrides(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const onSubmit = async (data) => {
    // validations liên quan expiry/account giữ nguyên
    for (const product of selectedProducts) {
      const selectedAccount = customerAccounts.find(
        (acc) => acc.accountName === accountName[product.id],
      )

      const accountProductId = selectedAccount?.expiries?.[0]?.productId
      const expiryDuration = expiryDurations[product.id]
      const isHasExpiry = product.hasExpiry && applyExpiryItems[product.id]

      if (accountProductId && accountProductId !== product.id) {
        toast.error('Tài khoản không khớp với sản phẩm')
        return
      }

      if (
        isHasExpiry &&
        (!expiryDuration?.value || expiryDuration.value <= 0)
      ) {
        toast.error(
          `Vui lòng nhập thời hạn gia hạn cho sản phẩm "${product.name}"`,
        )
        return
      }

      const hasAccount = !!accountName[product.id]
      const hasStartDate = !!productStartDate[product.id]

      if (isHasExpiry && (!hasAccount || !hasStartDate)) {
        toast.error(
          `Vui lòng nhập cả tài khoản và ngày bắt đầu cho sản phẩm "${product.name}"`,
        )
        return
      }

      if ((hasAccount && !hasStartDate) || (!hasAccount && hasStartDate)) {
        toast.error(
          `Vui lòng nhập cả tài khoản và ngày bắt đầu cho sản phẩm "${product.name}"`,
        )
        return
      }
    }

    const items = selectedProducts.map((product) => {
      const startDate = productStartDate[product.id]
        ? new Date(productStartDate[product.id]).toISOString()
        : null

      const selectedAccount = customerAccounts.find(
        (acc) => acc.accountName === accountName[product.id],
      )

      const isApplyExpiry = !!applyExpiryItems[product.id]
      const expiry = expiryDurations[product.id] || {}

      // ===== unit conversion fields =====
      const unitId =
        selectedUnitIds[product.id] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const unitName = getUnitNameById(product, unitId)
      const factor = getFactor(product, unitId)

      const qtyUnit = quantities[product.id] || 1
      const qtyBase = factor > 0 ? qtyUnit / factor : qtyUnit

      const priceUnit = getDisplayPrice(product)

      return {
        productId: product.id,
        image: product.image,
        productName: product.name,
        productType: product.type,

        unitId,
        unitName,

        // số lượng theo đơn vị khách chọn (để hiển thị/in)
        quantity: qtyUnit,

        // số lượng quy đổi về baseUnit (để backend trừ kho chính xác)
        baseQuantity: qtyBase,

        // optional: backend nên tự lookup lại factor từ DB
        conversionFactor: factor,

        giveaway: giveaway[product.id] || 0,
        price: priceUnit,

        taxAmount: calculateTaxForProduct(product.id),
        subTotal: calculateSubTotal(product.id),
        discount: discounts[product.id] || 0,
        total:
          calculateSubTotal(product.id) + calculateTaxForProduct(product.id),

        note: notes[product.id] || '',
        options: product.attributes || [],

        accountId: isApplyExpiry
          ? selectedAccount?.id?.toString() || null
          : null,
        accountName: isApplyExpiry ? accountName[product.id] || '' : '',
        startDate: isApplyExpiry ? startDate : null,
        applyExpiry: isApplyExpiry,
        expiryDuration: isApplyExpiry ? expiry.value : null,
        expiryUnit: isApplyExpiry ? expiry.unit : null,

        conditions:
          applyWarrantyItems[product.id] && product?.warrantyPolicy
            ? product?.warrantyPolicy?.conditions
            : '',
        periodMonths:
          applyWarrantyItems[product.id] && product?.warrantyPolicy
            ? product?.warrantyPolicy?.periodMonths
            : 0,
        warrantyCost:
          applyWarrantyItems[product.id] && product?.warrantyPolicy
            ? product?.warrantyPolicy?.warrantyCost
            : 0,
        applyWarranty: !!applyWarrantyItems[product.id],
      }
    })

    const dataToSend = {
      userId: authUserWithRoleHasPermissions.id,
      customerId: data.customerId,
      date: new Date().toISOString(),
      note: data.note,
      type,
      taxAmount: calculateTotalTax(),
      amount: calculateTotalAmount(),
      discount: calculateTotalDiscount(),
      subTotal: handleCalculateSubTotalInvoice(),
      status: data.status,
      items,
      createReceipt: isCreateReceipt,
      paymentMethod: data.paymentMethod,
      paymentNote: data.paymentNote,
      totalAmount: calculateTotalAmount(),
      bankAccount: data.paymentMethod === 'transfer' ? data.bankAccount : null,
      dueDate: data.dueDate || null,
      ...(otherExpenses?.price > 0 && { otherExpenses: [otherExpenses] }),
    }

    if (data.revenueSharing) {
      const { ratio, userId } = data.revenueSharing
      if (!ratio || !userId) {
        toast.error('Vui lòng chọn mức chia sẻ và người chia sẻ')
        return
      }
      dataToSend.revenueSharing = {
        sharePercentage: parseFloat(ratio) || 0,
        userId: parseInt(userId, 10) || null,
        amount: (calculateInvoiceTotal() - calculateTotalTax()) * ratio || 0,
      }
    }

    try {
      const invoice = await dispatch(createInvoice(dataToSend)).unwrap()

      const getAdminInvoice = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('GET_INVOICE')

      const invoiceId = invoice.id
      const invoiceData = getAdminInvoice
        ? await getInvoiceDetail(invoiceId)
        : await getInvoiceDetailByUser(invoiceId)

      if (hasPrintInvoice) {
        const generalInformationData = await dispatch(
          getSetting('general_information'),
        ).unwrap()
        setGeneralInformation(generalInformationData)
        setInvoice(invoiceData)

        setTimeout(() => {
          setInvoice(null)
          setHasPrintInvoice(false)
          form.reset()
          onOpenChange?.(false)
        }, 1000)
      } else if (hasPrintQuotation) {
        const baseQuotationData = buildQuotationData(invoiceData)
        setQuotationData(baseQuotationData)
        setQuotationFileName(`${invoiceData.code || 'quotation'}.pdf`)
        setShowQuotationPreview(true)
        setHasPrintQuotation(false)
      } else {
        form.reset()
        onOpenChange?.(false)
      }
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  const handleSelectProduct = (value) => {
    const productIds = value.map((product) => product.value)
    const selectProductDetails = products.filter((product) =>
      productIds.includes(product.id),
    )
    setSelectedProducts(selectProductDetails)

    // giữ lại ngày bắt đầu, expiry durations như cũ
    setProductStartDate((prev) => {
      const updated = {}
      for (const id of productIds) {
        if (prev[id]) updated[id] = prev[id]
      }
      return updated
    })

    setExpiryDurations((prev) => {
      const next = { ...prev }
      for (const p of selectProductDetails) {
        if (p.hasExpiry && !next[p.id]) {
          next[p.id] = { value: 1, unit: 'month' }
        }
      }
      return next
    })

    // ===== init unit & base price states =====
    setSelectedUnitIds((prev) => {
      const next = { ...prev }
      for (const p of selectProductDetails) {
        if (!next[p.id]) {
          next[p.id] = getBaseUnitId(p) || p?.prices?.[0]?.unitId
        }
      }
      // cleanup removed
      for (const k of Object.keys(next)) {
        if (!productIds.includes(Number(k))) delete next[k]
      }
      return next
    })

    setBaseUnitPrices((prev) => {
      const next = { ...prev }
      for (const p of selectProductDetails) {
        if (next[p.id] == null) next[p.id] = Number(p.price || 0) // base price
      }
      for (const k of Object.keys(next)) {
        if (!productIds.includes(Number(k))) delete next[k]
      }
      return next
    })

    setPriceOverrides((prev) => {
      const next = { ...prev }
      for (const k of Object.keys(next)) {
        if (!productIds.includes(Number(k))) delete next[k]
      }
      return next
    })
  }

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number(value),
    }))
  }

  const handleNoteChange = (productId, value) => {
    setNotes((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const handleApplyExpiryChange = (productId, checked) => {
    setApplyExpiryItems((prev) => ({
      ...prev,
      [productId]: !!checked,
    }))
    if (checked) {
      setExpiryDurations((prev) => ({
        ...prev,
        [productId]: prev[productId] || {
          value: 1,
          unit: 'month',
        },
      }))
    }
  }

  const handleExpiryDurationChange = (productId, field, value) => {
    setExpiryDurations((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { value: 1, unit: 'month' }),
        [field]: value,
      },
    }))
  }

  const handleApplyWarrantyChange = (productId, checked) => {
    setApplyWarrantyItems((prev) => ({
      ...prev,
      [productId]: !!checked,
    }))
  }

  const handleAccountNameChange = (productId, value) => {
    setAccountName((prev) => ({
      ...prev,
      [productId]: value,
    }))

    const selectedAcc = customerAccounts.find(
      (acc) => acc.accountName === value,
    )
    if (selectedAcc && selectedAcc.expiries?.[0]?.endDate) {
      const endDate = new Date(selectedAcc.expiries[0].endDate)
      const nextStartDate = new Date(endDate)
      nextStartDate.setDate(nextStartDate.getDate() + 1)

      setProductStartDate((prev) => ({
        ...prev,
        [productId]: nextStartDate,
      }))
    }
  }

  const calculateSubTotal = (productId) => {
    const quantity = quantities[productId] || 1
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0

    const discount = discounts[productId] || 0
    const price = getDisplayPrice(product)

    const subtotal = quantity * price
    return subtotal - discount > 0 ? subtotal - discount : 0
  }

  const handleDiscountChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setDiscounts((prev) => ({
      ...prev,
      [productId]: numericValue,
    }))
  }

  // user sửa giá theo đơn vị đang chọn -> store override
  const handlePriceChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setPriceOverrides((prev) => ({
      ...prev,
      [productId]: numericValue,
    }))
  }

  const handleGiveawayChange = (productId, value) => {
    setGiveaway((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const calculateInvoiceTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = quantities[product.id] || 1
      const discount = discounts[product.id] || 0
      const price = getDisplayPrice(product)

      const subtotal = quantity * price
      const totalForProduct = subtotal - discount > 0 ? subtotal - discount : 0
      return total + totalForProduct
    }, 0)
  }

  const calculateTotalDiscount = () => {
    return selectedProducts.reduce((totalDiscount, product) => {
      return totalDiscount + (discounts[product.id] || 0)
    }, 0)
  }

  const handleTaxChange = (productId, taxId, isChecked) => {
    setSelectedTaxes((prev) => {
      const productTaxes = prev[productId] || []
      return {
        ...prev,
        [productId]: isChecked
          ? [...productTaxes, taxId]
          : productTaxes.filter((id) => id !== taxId),
      }
    })
  }

  const calculateTotalTax = () => {
    return selectedProducts.reduce((totalTax, product) => {
      return totalTax + calculateTaxForProduct(product.id)
    }, 0)
  }

  const calculateTaxForProduct = (productId) => {
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0

    const quantity = quantities[productId] || 1
    const price = getDisplayPrice(product)
    const basePrice = price * quantity

    const selectedProductTaxes = selectedTaxes[productId] || []
    const taxes = product?.prices?.[0]?.taxes || []

    const taxAmount = taxes
      .filter((tax) => selectedProductTaxes.includes(tax.id))
      .reduce((sum, tax) => sum + (basePrice * tax.percentage) / 100, 0)

    return taxAmount
  }

  const handleCalculateSubTotalInvoice = () => {
    return selectedProducts.reduce((subTotal, product) => {
      const price = getDisplayPrice(product)
      const quantity = quantities[product.id] || 1
      const total = price * quantity
      return subTotal + total
    }, 0)
  }

  const calculateTotalAmount = () => {
    const total =
      calculateInvoiceTotal() + calculateTotalTax() + calculateExpenses()
    return total
  }

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    setTotalAmount(rawValue)
    form.setValue('totalAmount', rawValue)
  }

  const handleSetOtherExpenses = (data) => {
    setOtherExpenses(data)
  }

  const calculateExpenses = () => {
    const totalExpenses = otherExpenses.price
    return totalExpenses
  }

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer)
    form.setValue('customerId', customer?.id.toString())

    try {
      const res = await dispatch(
        getExpiriesByCustomerId({ customerId: customer.id }),
      ).unwrap()

      const accounts = res?.data?.accounts || []
      setCustomerAccounts(accounts)

      const nextApplyExpiry = {}
      const nextAccountName = {}
      const nextStartDate = {}
      const nextExpiryDuration = {}

      for (const acc of accounts) {
        const expiry = acc.expiries?.[0]
        if (!expiry) continue
        const productId = expiry.productId
        nextApplyExpiry[productId] = true
        nextAccountName[productId] = acc.accountName
        if (expiry.endDate) {
          const d = new Date(expiry.endDate)
          d.setDate(d.getDate() + 1)
          nextStartDate[productId] = d
        }
      }

      for (const acc of accounts) {
        const expiry = acc.expiries?.[0]
        if (!expiry) continue

        const productId = expiry.productId
        nextExpiryDuration[productId] = {
          value: expiry.period || 1,
          unit: expiry.unit || 'month',
        }
      }

      setExpiryDurations((prev) => ({ ...prev, ...nextExpiryDuration }))
      setApplyExpiryItems((prev) => ({ ...prev, ...nextApplyExpiry }))
      setAccountName((prev) => ({ ...prev, ...nextAccountName }))
      setProductStartDate((prev) => ({ ...prev, ...nextStartDate }))
    } catch {
      setCustomerAccounts([])
    }
  }

  const paymentMethod = form.watch('paymentMethod')

  useEffect(() => {
    if (paymentMethod !== 'transfer') {
      form.setValue('bankAccount', null)
    }
  }, [paymentMethod, form])

  const getProductTypeLabel = (type) => productTypeMap[type] || type

  // Show available products for quick select (simplified - no complex calculation yet)
  const popularProducts = useMemo(() => {
    if (!products || products.length === 0) return []

    // Just show first 15 products that have stock
    return products
      .filter(p => 1 > 0)
      .slice(0, 15)
  }, [products])

  // Handle quick select from popular products
  const handleQuickSelectProduct = (product) => {
    // Check if product is already selected
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id)

    if (isAlreadySelected) {
      // Remove product if already selected
      const newSelectedProducts = selectedProducts.filter(p => p.id !== product.id)
      setSelectedProducts(newSelectedProducts)

      // Clean up related states
      const newProductIds = newSelectedProducts.map(p => p.id)
      setSelectedUnitIds(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setBaseUnitPrices(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setPriceOverrides(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
    } else {
      // Add product to selected list
      handleSelectProduct([...selectedProducts.map(p => ({ value: p.id, label: p.name })), { value: product.id, label: product.name }])
    } ``
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button className="mx-2" variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Tạo hóa đơn
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 m-0">
          <DialogHeader className="px-6 pt-4">
            <DialogTitle>
              Tạo hóa đơn mới
            </DialogTitle>
            <DialogDescription>
              Chọn sản phẩm và điền thông tin để tạo hóa đơn
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden border-t">
              {/* 4-COLUMN LAYOUT */}
              <div className="flex flex-1 overflow-hidden">
                {/* LEFT SECTION: Category + Products */}
                <div className="flex flex-col flex-1">
                  {/* UNIFIED SEARCH BAR spanning columns 1 & 2 */}
                  <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Hiển thị {filteredProducts.length} / {products.length} sản phẩm
                    </div>
                  </div>

                  {/* Category + Product Grid Row */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* COLUMN 1: Category Sidebar */}
                    <CategorySidebar
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      productCounts={productCounts}
                    />

                    {/* COLUMN 2: Product Grid */}
                    <ProductGrid
                      products={filteredProducts}
                      onAddProduct={handleAddProduct}
                      selectedProductIds={selectedProducts.map(p => p.id)}
                      loading={false}
                    />
                  </div>
                </div>

                {/* COLUMN 3: Shopping Cart */}
                <ShoppingCart
                  selectedProducts={selectedProducts}
                  quantities={quantities}
                  selectedUnitIds={selectedUnitIds}
                  priceOverrides={priceOverrides}
                  discounts={discounts}
                  selectedTaxes={selectedTaxes}
                  notes={notes}
                  giveaway={giveaway}
                  onQuantityChange={handleQuantityChange}
                  onUnitChange={handleUnitChange}
                  onPriceChange={handlePriceChange}
                  onDiscountChange={handleDiscountChange}
                  onTaxChange={handleTaxChange}
                  onNoteChange={handleNoteChange}
                  onGiveawayChange={handleGiveawayChange}
                  onRemoveProduct={handleRemoveProduct}
                  getUnitOptions={getUnitOptions}
                  getDisplayPrice={getDisplayPrice}
                  calculateSubTotal={calculateSubTotal}
                  calculateTaxForProduct={calculateTaxForProduct}
                />

                {/* COLUMN 4: Invoice Sidebar */}
                <InvoiceSidebar
                  form={form}
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={(customer) => {
                    setSelectedCustomer(customer)
                    if (customer) {
                      form.setValue('customerId', customer.id.toString())
                      handleSelectCustomer(customer)
                    } else {
                      form.setValue('customerId', '')
                    }
                  }}
                  paymentMethods={paymentMethods}
                  calculateSubTotal={handleCalculateSubTotalInvoice}
                  calculateTotalTax={calculateTotalTax}
                  calculateTotalDiscount={calculateTotalDiscount}
                  calculateTotalAmount={calculateTotalAmount}
                  calculateExpenses={calculateExpenses}
                  onSubmit={onSubmit}
                  loading={loading}
                  onShowCreateCustomer={() => setShowCreateCustomerDialog(true)}
                  onShowUpdateCustomer={() => setShowUpdateCustomerDialog(true)}
                  onPrintInvoice={() => setHasPrintInvoice(true)}
                  onPrintQuotation={() => setHasPrintQuotation(true)}
                />
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Supporting Dialogs */}
      {showUpdateCustomerDialog && (
        <UpdateCustomerDialog
          open={showUpdateCustomerDialog}
          onOpenChange={setShowUpdateCustomerDialog}
          customer={selectedCustomer}
          showTrigger={false}
        />
      )}

      {showCreateCustomerDialog && (
        <CreateCustomerDialog
          open={showCreateCustomerDialog}
          onOpenChange={setShowCreateCustomerDialog}
          showTrigger={false}
        />
      )}

      {showCreateOtherExpensesDialog && (
        <CreateOtherExpenses
          open={showCreateOtherExpensesDialog}
          onOpenChange={setShowCreateOtherExpensesDialog}
          showTrigger={false}
          setOtherExpenses={handleSetOtherExpenses}
          otherExpenses={otherExpenses}
        />
      )}

      {invoice && generalInformation && (
        <PrintInvoiceView invoice={invoice} setting={generalInformation} />
      )}

      {quotationData && (
        <QuotationPreviewDialog
          open={showQuotationPreview}
          onOpenChange={(open) => {
            if (!open) {
              setShowQuotationPreview(false)
              form.reset()
              onOpenChange?.(false)
            }
          }}
          initialData={quotationData}
          onConfirm={async (finalData) => {
            try {
              await exportQuotationPdf(finalData, quotationFileName)
              toast.success('Đã xuất báo giá thành công!')

              setShowQuotationPreview(false)
              form.reset()
              onOpenChange?.(false)
            } catch (error) {
              console.error('Export quotation error:', error)
              toast.error('Xuất báo giá thất bại')
            }
          }}
        />
      )}

      {showCreateProductDialog && (
        <CreateProductDialog
          open={showCreateProductDialog}
          onOpenChange={(open) => {
            setShowCreateProductDialog(open)
            if (!open) dispatch(getProducts())
          }}
          showTrigger={false}
        />
      )}
    </>
  )
}

export default CreateInvoiceDialog
