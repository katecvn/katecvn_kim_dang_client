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
import { CheckIcon, Mail, MapPin, Pencil, Plus, X } from 'lucide-react'
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
import { exportQuotationPdf } from '../helpers/ExportQuotationPdf'
import { buildQuotationData } from '../helpers/BuildQuotationData'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'
import QuotationPreviewDialog from '../components_notuse/QuotationPreviewDialog'
import CreateProductDialog from '../../product/components/CreateProductDialog'
import Can from '@/utils/can'
import { getSettingApi } from '@/api/setting'

const CreateInvoiceDialog = ({
  type,
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
    },
  })

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
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button className="mx-2" variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Lưu
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="md:h-auto md:max-w-full">
          <DialogHeader>
            <DialogTitle>Thêm hóa đơn mới</DialogTitle>
            <DialogDescription>
              Hoàn thành các thông tin dưới đây để có thể thêm hóa đơn mới
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
            <Form {...form}>
              <form id="create-invoice" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="flex-1 space-y-6 rounded-lg border p-4 lg:max-w-[79vw]">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">Thông tin đơn</h2>
                      <Can permission={'CREATE_PRODUCT'}>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => setShowCreateProductDialog(true)}
                        >
                          <PlusIcon
                            className="mr-2 size-4"
                            aria-hidden="true"
                          />
                          Thêm sản phẩm
                        </Button>
                      </Can>
                    </div>

                    <div className="space-y-6">
                      {selectedProducts.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border">
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead className="w-8">TT</TableHead>
                                <TableHead className="min-w-40">
                                  Sản phẩm
                                </TableHead>
                                <TableHead className="min-w-16">SL</TableHead>
                                <TableHead className="min-w-16">Tặng</TableHead>
                                <TableHead className="min-w-24">ĐVT</TableHead>
                                <TableHead className="min-w-20">Giá</TableHead>
                                <TableHead className="min-w-20">Thuế</TableHead>
                                <TableHead className="min-w-28 md:w-16">
                                  Giảm giá
                                </TableHead>
                                <TableHead className="min-w-28">
                                  Tổng cộng
                                </TableHead>
                                <TableHead className="min-w-28 md:w-20">
                                  BH
                                </TableHead>
                                <TableHead className="min-w-28">
                                  Ghi chú
                                </TableHead>
                                <TableHead className="min-w-24">
                                  Hạn dùng
                                </TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {selectedProducts.map((product, index) => {
                                const currentUnitId =
                                  selectedUnitIds[product.id] ||
                                  getBaseUnitId(product) ||
                                  product?.prices?.[0]?.unitId

                                const unitOptions = getUnitOptions(product)

                                return (
                                  <TableRow key={product.id}>
                                    <TableCell>{index + 1}</TableCell>

                                    <TableCell>
                                      <div>
                                        <div className="font-medium">
                                          {product.name}
                                        </div>

                                        <span className="break-words text-xs text-muted-foreground">
                                          {`ĐVT gốc: ${getBaseUnitName(product)}`}
                                        </span>

                                        {Array.isArray(
                                          product?.unitConversions,
                                        ) &&
                                          product.unitConversions.length >
                                          0 && (
                                            <div className="mt-1 break-words text-[11px] text-muted-foreground">
                                              Quy đổi:{' '}
                                              {product.unitConversions
                                                .map((c) => {
                                                  const f = Number(
                                                    c?.conversionFactor || 0,
                                                  )
                                                  const u = c?.unit?.name || '—'
                                                  // 1 base = f * u
                                                  return f > 0
                                                    ? `1 ${getBaseUnitName(
                                                      product,
                                                    )} = ${f} ${u}`
                                                    : null
                                                })
                                                .filter(Boolean)
                                                .join(' • ')}
                                            </div>
                                          )}

                                        {product?.attributes && (
                                          <div className="break-words text-sm text-muted-foreground">
                                            {product.attributes
                                              .map(
                                                (attribute) =>
                                                  `${attribute.name}: ${attribute.pivot.value} (${attributes[attribute.unit]})`,
                                              )
                                              .join(', ')}
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>

                                    <TableCell>
                                      <Input
                                        value={quantities[product.id] || 1}
                                        type="number"
                                        className="h-7 w-16"
                                        onChange={(e) =>
                                          handleQuantityChange(
                                            product.id,
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </TableCell>

                                    <TableCell>
                                      <Input
                                        value={giveaway[product.id] || 0}
                                        type="number"
                                        className="h-7 w-16"
                                        min={0}
                                        onChange={(e) =>
                                          handleGiveawayChange(
                                            product.id,
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </TableCell>

                                    {/* ===== ĐVT (chọn theo quy đổi) ===== */}
                                    <TableCell>
                                      <Select
                                        value={
                                          currentUnitId
                                            ? currentUnitId.toString()
                                            : ''
                                        }
                                        onValueChange={(val) => {
                                          const newUnitId = Number(val)
                                          setSelectedUnitIds((prev) => ({
                                            ...prev,
                                            [product.id]: newUnitId,
                                          }))

                                          // đổi đơn vị thì bỏ override để tự tính lại
                                          setPriceOverrides((prev) => {
                                            const next = { ...prev }
                                            delete next[product.id]
                                            return next
                                          })
                                        }}
                                      >
                                        <SelectTrigger className="h-7 w-28">
                                          <SelectValue placeholder="ĐVT" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            {unitOptions.map((o) => (
                                              <SelectItem
                                                key={o.unitId}
                                                value={o.unitId.toString()}
                                              >
                                                {o.unitName}
                                              </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>

                                    {/* ===== Giá theo ĐVT ===== */}
                                    <TableCell className="text-end">
                                      <MoneyInputQuick
                                        value={getDisplayPrice(product) ?? 0}
                                        onChange={(num) =>
                                          handlePriceChange(
                                            product.id,
                                            String(num),
                                          )
                                        }
                                        placeholder="0"
                                        className="h-7 w-24"
                                      />
                                    </TableCell>

                                    <TableCell>
                                      <FormField
                                        control={form.control}
                                        name="taxes"
                                        render={() => (
                                          <FormItem>
                                            {(
                                              product?.prices?.[0]?.taxes || []
                                            ).map((tax) => (
                                              <FormItem
                                                key={tax.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                              >
                                                <FormControl>
                                                  <Checkbox
                                                    onCheckedChange={(
                                                      isChecked,
                                                    ) =>
                                                      handleTaxChange(
                                                        product.id,
                                                        tax.id,
                                                        isChecked,
                                                      )
                                                    }
                                                    checked={
                                                      selectedTaxes[
                                                        product.id
                                                      ]?.includes(tax.id) ||
                                                      false
                                                    }
                                                  />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">
                                                  {tax.title} -{' '}
                                                  <strong className="text-destructive">
                                                    ({tax.percentage}%)
                                                  </strong>
                                                </FormLabel>
                                              </FormItem>
                                            ))}
                                          </FormItem>
                                        )}
                                      />
                                    </TableCell>

                                    <TableCell>
                                      <MoneyInputQuick
                                        value={discounts[product.id] ?? 0}
                                        onChange={(num) =>
                                          handleDiscountChange(
                                            product.id,
                                            String(num),
                                          )
                                        }
                                        placeholder="0"
                                        className="h-7 w-24"
                                      />
                                    </TableCell>

                                    <TableCell className="text-end">
                                      {moneyFormat(
                                        calculateSubTotal(product.id),
                                      )}
                                    </TableCell>

                                    <TableCell className="text-center">
                                      {product.warrantyPolicy ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <Checkbox
                                            checked={
                                              !!applyWarrantyItems[product.id]
                                            }
                                            onCheckedChange={(checked) =>
                                              handleApplyWarrantyChange(
                                                product.id,
                                                checked,
                                              )
                                            }
                                          />
                                          <span className="text-[11px] text-muted-foreground">
                                            {
                                              product.warrantyPolicy
                                                .periodMonths
                                            }{' '}
                                            tháng
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] italic text-muted-foreground">
                                          Không BH
                                        </span>
                                      )}
                                    </TableCell>

                                    <TableCell className="text-end">
                                      <Textarea
                                        onChange={(e) =>
                                          handleNoteChange(
                                            product.id,
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Ghi chú"
                                        rows={1}
                                        type="text"
                                        className="h-7 w-full"
                                      />
                                    </TableCell>

                                    <TableCell className="align-top">
                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-center gap-1">
                                          {product.hasExpiry ? (
                                            <>
                                              <Checkbox
                                                checked={
                                                  !!applyExpiryItems[product.id]
                                                }
                                                onCheckedChange={(checked) =>
                                                  handleApplyExpiryChange(
                                                    product.id,
                                                    checked,
                                                  )
                                                }
                                              />
                                              {customerAccounts.some(
                                                (acc) =>
                                                  acc.expiries?.[0]
                                                    ?.productId === product.id,
                                              ) && (
                                                  <span className="text-[10px] italic text-primary">
                                                    Gợi ý
                                                  </span>
                                                )}
                                            </>
                                          ) : (
                                            <span className="text-xs italic text-muted-foreground">
                                              Không áp dụng
                                            </span>
                                          )}
                                        </div>

                                        <Input
                                          className="h-7"
                                          placeholder="Tài khoản"
                                          value={accountName[product.id] || ''}
                                          onChange={(e) =>
                                            handleAccountNameChange(
                                              product.id,
                                              e.target.value,
                                            )
                                          }
                                          list="accountNameSuggestions"
                                          disabled={
                                            !applyExpiryItems[product.id]
                                          }
                                        />

                                        <Popover>
                                          <PopoverTrigger
                                            asChild
                                            disabled={
                                              !applyExpiryItems[product.id]
                                            }
                                          >
                                            <Button
                                              variant="outline"
                                              className={cn(
                                                'h-7 w-full justify-start text-left font-normal',
                                                !productStartDate[product.id] &&
                                                'text-muted-foreground',
                                              )}
                                            >
                                              {productStartDate[product.id]
                                                ? dateFormat(
                                                  productStartDate[
                                                  product.id
                                                  ],
                                                )
                                                : 'Ngày bắt đầu'}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                            <DatePicker
                                              mode="single"
                                              selected={
                                                productStartDate[product.id]
                                              }
                                              onSelect={(date) =>
                                                handleStartDateChange(
                                                  product.id,
                                                  date,
                                                )
                                              }
                                              disabled={
                                                !applyExpiryItems[product.id]
                                              }
                                            />
                                          </PopoverContent>
                                        </Popover>

                                        <div className="flex gap-1">
                                          <Input
                                            type="number"
                                            min={1}
                                            className="h-7 w-20 text-center"
                                            value={
                                              expiryDurations[product.id]
                                                ?.value || 1
                                            }
                                            onChange={(e) =>
                                              handleExpiryDurationChange(
                                                product.id,
                                                'value',
                                                Number(e.target.value),
                                              )
                                            }
                                            disabled={
                                              !applyExpiryItems[product.id]
                                            }
                                          />

                                          <Select
                                            value={
                                              expiryDurations[product.id]
                                                ?.unit || 'month'
                                            }
                                            onValueChange={(value) =>
                                              handleExpiryDurationChange(
                                                product.id,
                                                'unit',
                                                value,
                                              )
                                            }
                                            disabled={
                                              !applyExpiryItems[product.id]
                                            }
                                          >
                                            <SelectTrigger className="h-7 w-full">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="month">
                                                Tháng
                                              </SelectItem>
                                              <SelectItem value="year">
                                                Năm
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      <MultipleSelector
                        emptyIndicator={
                          <p className="text-center text-xs leading-10 text-muted-foreground">
                            Không có kết quả nào được tìm thấy
                          </p>
                        }
                        hidePlaceholderWhenSelected={true}
                        onChange={(value) => handleSelectProduct(value)}
                        options={products.map((product) => ({
                          label: `${product.name} - ${moneyFormat(
                            product.price,
                          )} - (Loại: ${getProductTypeLabel(
                            product.type,
                          )}, ĐVT gốc: ${getBaseUnitName(
                            product,
                          )}, HS: ${product?.coefficient?.coefficient || 0}, Tồn: ${product?.productStocks?.[0]?.quantity || 0
                            })`,
                          value: product.id,
                        }))}
                        placeholder="Tìm kiếm sản phẩm"
                      />

                      {/* Popular Products Quick Select */}
                      {popularProducts.length > 0 && (
                        <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                          <h3 className="mb-3 text-sm font-semibold text-foreground">
                            Sản phẩm phổ biến
                          </h3>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {popularProducts.map((product) => {
                              const isSelected = selectedProducts.some(
                                (p) => p.id === product.id,
                              )
                              const stock = product.productStocks?.[0]?.quantity || 0

                              return (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => handleQuickSelectProduct(product)}
                                  className={cn(
                                    'group relative flex flex-col items-start gap-1 rounded-md border p-2 text-left transition-all hover:border-primary hover:bg-accent',
                                    isSelected
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border bg-background',
                                  )}
                                >
                                  {/* Selected indicator */}
                                  {isSelected && (
                                    <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                      <CheckIcon className="h-3 w-3" />
                                    </div>
                                  )}

                                  {/* Product name */}
                                  <div className="w-full pr-6">
                                    <p className="line-clamp-2 text-xs font-medium leading-tight">
                                      {product.name}
                                    </p>
                                  </div>

                                  {/* Price and stock */}
                                  <div className="flex w-full flex-col gap-0.5">
                                    <p className="text-xs font-semibold text-primary">
                                      {moneyFormat(product.price)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Tồn: {stock}
                                    </p>
                                  </div>

                                  {/* Add/Remove indicator */}
                                  <div className="absolute bottom-1 right-1">
                                    {isSelected ? (
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                        <X className="h-3 w-3" />
                                      </div>
                                    ) : (
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                        <Plus className="h-3 w-3" />
                                      </div>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}


                      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                        <div className="flex flex-col space-y-4">
                          <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                              <FormItem className="mb-2 space-y-1">
                                <FormLabel>Ghi chú</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={3}
                                    placeholder="Nhập ghi chú nếu có"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {selectedCustomer && (
                            <div className="mt-2">
                              <div className="mb-1 text-sm font-semibold">
                                Tài khoản khách hàng
                              </div>
                              {customerAccounts.length > 0 ? (
                                <ul className="space-y-1">
                                  {customerAccounts.map((acc) => (
                                    <li
                                      key={acc.id}
                                      className="flex items-center justify-between border-b pb-1"
                                    >
                                      <span className="font-small text-sm">
                                        {acc.accountName}
                                      </span>
                                      <span className="font-small text-sm">
                                        {acc.expiries?.[0]?.product?.name}
                                      </span>
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        HSD:{' '}
                                        {acc.expiries?.[0]?.endDate
                                          ? dateFormat(acc.expiries[0].endDate)
                                          : 'Chưa có hạn'}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-xs text-muted-foreground">
                                  Khách hàng chưa có tài khoản nào.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <div className="text-sm font-bold">Tạm tính:</div>
                            <div className="text-sm">
                              {moneyFormat(handleCalculateSubTotalInvoice())}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <div className="text-sm font-bold">Thuế:</div>
                            <div className="text-sm">
                              {moneyFormat(calculateTotalTax())}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <div className="text-sm font-bold">Giảm giá:</div>
                            <div className="text-sm">
                              {moneyFormat(calculateTotalDiscount())}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <div className="text-sm font-bold">
                              Phí vận chuyển:
                            </div>
                            <div className="text-sm">
                              {moneyFormat(otherExpenses.price)}
                            </div>
                          </div>

                          <div className="text-sm font-bold text-primary">
                            <Button
                              onClick={() =>
                                setShowCreateOtherExpensesDialog(true)
                              }
                              type="button"
                              variant="outline"
                              className="h-6 border border-primary"
                            >
                              <IconPencil className="h-4 w-4" /> Cập nhật phí
                              vận chuyển
                            </Button>
                          </div>

                          <div className="flex justify-between border-t py-2">
                            <div className="text-sm font-bold">
                              Tổng số tiền:
                            </div>
                            <div className="text-sm">
                              {moneyFormat(calculateTotalAmount())}
                            </div>
                          </div>

                          <div className="flex justify-start border-t py-2">
                            <div className="text-sm font-bold">
                              Số tiền viết bằng chữ:
                              <span className="ml-1">
                                {toVietnamese(calculateTotalAmount())}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full rounded-lg border p-4 lg:w-72">
                    <div className="flex items-center justify-between">
                      <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>

                      {selectedCustomer && (
                        <div
                          className="h-5 w-5 cursor-pointer text-destructive"
                          title="Chọn lại"
                        >
                          <X
                            className="h-5 w-5"
                            onClick={() => {
                              setSelectedCustomer(null)
                              form.setValue('customerId', null)
                              setCustomerAccounts([])
                              setProductStartDate({})
                              setAccountName({})
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {selectedCustomer ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedCustomer?.name}`}
                              alt={selectedCustomer?.name}
                            />
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {selectedCustomer.name}
                            </div>
                            <div className="cursor-pointer text-sm text-primary hover:text-secondary-foreground">
                              {selectedCustomer.invoiceCount} hóa đơn
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="font-medium">
                              Thông tin khách hàng
                            </div>
                            <a
                              role="button"
                              onClick={() => setShowUpdateCustomerDialog(true)}
                              size="icon"
                              title="Cập nhật thông tin khách hàng"
                            >
                              <Pencil className="h-4 w-4" />
                            </a>
                          </div>

                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <MobileIcon className="h-4 w-4" />
                              </div>
                              <a href={`tel:${selectedCustomer.phone}`}>
                                {selectedCustomer.phone || 'Chưa cập nhật'}
                              </a>
                            </div>

                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <Mail className="h-4 w-4" />
                              </div>
                              <a href={`mailto:${selectedCustomer.email}`}>
                                {selectedCustomer.email || 'Chưa cập nhật'}
                              </a>
                            </div>

                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <MapPin className="h-4 w-4" />
                              </div>
                              {selectedCustomer.address || 'Chưa cập nhật'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="customerId"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel required={true}>Khách hàng</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        '!mt-[4px] w-full justify-between font-normal',
                                        !field.value && 'text-muted-foreground',
                                      )}
                                    >
                                      {field.value
                                        ? customers.find(
                                          (customer) =>
                                            customer.id === field.value,
                                        )?.name
                                        : 'Chọn khách hàng'}
                                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="Tìm kiếm..."
                                      className="h-9"
                                    />
                                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                                    <CommandGroup>
                                      <CommandList>
                                        {customers &&
                                          customers.map((customer) => (
                                            <CommandItem
                                              value={customer.id}
                                              key={customer.id}
                                              onSelect={async () => {
                                                await handleSelectCustomer(
                                                  customer,
                                                )
                                              }}
                                            >
                                              {customer.name} - {customer.phone}
                                              <CheckIcon
                                                className={cn(
                                                  'ml-auto h-4 w-4',
                                                  customer.id === field.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                                )}
                                              />
                                            </CommandItem>
                                          ))}
                                      </CommandList>
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div
                          className="my-3 flex cursor-pointer items-center text-sm text-primary hover:text-secondary-foreground hover:underline"
                          onClick={() => setShowCreateCustomerDialog(true)}
                        >
                          <div className="mr-2 h-4 w-4">
                            <Plus className="h-4 w-4" />
                          </div>
                          Thêm khách hàng mới
                        </div>
                      </>
                    )}

                    <Separator />

                    <div
                      className="my-3 flex cursor-pointer items-center text-sm text-primary hover:text-secondary-foreground hover:underline"
                      onClick={() => handleCreateReceipt()}
                    >
                      <div className="mr-2 h-4 w-4">
                        <IconReceipt2 className="h-4 w-4" />
                      </div>
                      Tạo phiếu thu
                    </div>

                    {isCreateReceipt && (
                      <div className="mb-3">
                        <FormField
                          control={form.control}
                          name="totalAmount"
                          render={() => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel required={true}>Số tiền thu</FormLabel>
                              <FormControl>
                                <Input
                                  value={moneyFormat(
                                    totalAmount || calculateTotalAmount(),
                                  )}
                                  placeholder="0"
                                  className="w-full text-end"
                                  onChange={handleInputChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="mb-3">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem className="mb-3 space-y-1">
                                <FormLabel required={true}>
                                  Phương thức thanh toán
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn phương thức" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectGroup>
                                      {paymentMethods.map((method) => (
                                        <SelectItem
                                          key={method.label}
                                          value={method.value}
                                        >
                                          <div className="flex items-center">
                                            <div className="mr-2 h-4 w-4">
                                              <method.icon className="h-4 w-4 text-primary" />
                                            </div>
                                            {method.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {paymentMethod === 'transfer' && (
                          <FormField
                            control={form.control}
                            name="bankAccount"
                            render={({ field }) => (
                              <FormItem className="mb-3 space-y-1">
                                <FormLabel required={true}>
                                  Tài khoản nhận tiền
                                </FormLabel>

                                <Select
                                  onValueChange={(value) => {
                                    const selectedBank = banks.find(
                                      (b) => b.accountNumber === value,
                                    )
                                    field.onChange(selectedBank)
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                                    </SelectTrigger>
                                  </FormControl>

                                  <SelectContent>
                                    {banks.map((bank, index) => (
                                      <SelectItem
                                        key={index}
                                        value={bank.accountNumber}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {bank.bankName} –{' '}
                                            {bank.accountNumber}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {bank.accountName} ·{' '}
                                            {bank.bankBranch}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="mb-3">
                          <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                              <FormItem className="mb-3 space-y-1">
                                <FormLabel>Hạn chót đóng tiền</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="paymentNote"
                            render={({ field }) => (
                              <FormItem className="mb-2 space-y-1">
                                <FormLabel>Ghi chú thanh toán</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={3}
                                    placeholder="Nhập ghi chú nếu có"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div
                      className="my-3 flex cursor-pointer items-center text-sm text-primary hover:text-secondary-foreground hover:underline"
                      onClick={() => setIsSharing(true)}
                    >
                      <div className="mr-2 h-4 w-4">
                        <IconUserShare className="h-4 w-4" />
                      </div>
                      Tỉ lệ hưởng doanh số
                    </div>

                    {isSharing && (
                      <>
                        <FormField
                          control={form.control}
                          name="revenueSharing.ratio"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-3">
                              <FormLabel>Chọn mức</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {sharingRatios?.payload.map(
                                    (ratio, index) => (
                                      <FormItem
                                        key={`ratio-${index}`}
                                        className="flex items-center space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <RadioGroupItem
                                            value={(ratio.sub / 10).toString()}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {ratio.main}/{ratio.sub} (Chia:{' '}
                                          {moneyFormat(
                                            (handleCalculateSubTotalInvoice() -
                                              calculateTotalDiscount()) *
                                            (ratio.sub / 10),
                                          )}
                                          )
                                        </FormLabel>
                                      </FormItem>
                                    ),
                                  )}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="revenueSharing.userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chọn người</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn người ăn chia" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {users
                                    ?.filter(
                                      (user) =>
                                        user.id !==
                                        authUserWithRoleHasPermissions.id,
                                    )
                                    .map((user) => (
                                      <SelectItem
                                        key={`user-${user.id}`}
                                        value={user.id.toString()}
                                      >
                                        {user.fullName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {isSharing && (
                      <div className="my-3 flex cursor-pointer items-center justify-end text-sm font-semibold text-destructive">
                        <div
                          className="flex items-center rounded-md border border-destructive px-2 py-1"
                          onClick={() => {
                            setIsSharing(false)
                            form.setValue('revenueSharing', null)
                          }}
                        >
                          <div className="mr-2 h-4 w-4">
                            <IconCircleX className="h-4 w-4" />
                          </div>
                          Hủy
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
            </DialogClose>

            <Button
              form="create-invoice"
              disabled={
                loading || !selectedCustomer || !selectedProducts.length
              }
              onClick={() => setHasPrintQuotation(true)}
              className="w-full sm:w-auto"
            >
              <IconFileTypePdf className="me-2 h-4 w-4" />
              Lưu và in báo giá
            </Button>

            <Button
              form="create-invoice"
              disabled={
                loading || !selectedCustomer || !selectedProducts.length
              }
              onClick={() => setHasPrintInvoice(true)}
              className="w-full sm:w-auto"
            >
              <IconFileTypePdf className="me-2 h-4 w-4" /> Lưu và in
            </Button>

            <Button
              form="create-invoice"
              disabled={
                loading || !selectedCustomer || !selectedProducts.length
              }
              className="w-full sm:w-auto"
            >
              <IconDatabasePlus className="me-2 h-4 w-4" /> Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
