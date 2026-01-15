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
import { useEffect, useState } from 'react'
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
import { attributes } from '../../invoice/data'
import { createInvoiceSchema } from '../../invoice/schema'
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
import PrintInvoiceView from '../../invoice/components/PrintInvoiceView'
import CreateOtherExpenses from '../../invoice/components/CreateOtherExpenses'
import { addDays, dateFormat } from '@/utils/date-format'
import { DatePicker } from '@/components/custom/DatePicker'
import { getExpiry } from '@/stores/ExpirySlice'

const CreateInvoiceWithExpiryDialog = ({
  type,
  open,
  onOpenChange,
  showTrigger = true,
  accountData,
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
  const [hasPrintInvoice, setHasPrintInvoice] = useState(false)
  const [generalInformation, setGeneralInformation] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [showUpdateCustomerDialog, setShowUpdateCustomerDialog] =
    useState(false)
  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)
  const handleStartDateChange = (productId, date) => {
    setProductStartDate((prev) => ({ ...prev, [productId]: date }))
  }
  const [selectedProducts, setSelectedProducts] = useState([])
  const [discounts, setDiscounts] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState({})
  const [giveaway, setGiveaway] = useState({})
  const [expiredName, setExpiredName] = useState({})
  const [selectedTaxes, setSelectedTaxes] = useState({})
  const sharingRatios = useSelector((state) => state.setting.setting)
  const users = useSelector((state) => state.user.users)
  const [isSharing, setIsSharing] = useState(false)
  const [totalAmount, setTotalAmount] = useState('')
  const [isCreateReceipt, setIsCreateReceipt] = useState(false)
  const [showCreateOtherExpensesDialog, setShowCreateOtherExpensesDialog] =
    useState(false)
  const [otherExpenses, setOtherExpenses] = useState({
    price: 0,
    description: 'Phí vận chuyển',
  })
  const [expiryDurations, setExpiryDurations] = useState({})
  const [applyWarrantyItems, setApplyWarrantyItems] = useState({})

  useEffect(() => {
    dispatch(getProducts())
    dispatch(getCustomers())
    dispatch(getSetting('sharing_ratio'))
    dispatch(getUsers())
  }, [dispatch])

  useEffect(() => {
    if (!open) return

    const customer = customers.find((c) => c.id === accountData.customerId)
    if (customer) setSelectedCustomer(customer)

    const firstExpiry = accountData?.expiries?.[0]
    if (firstExpiry && products.length > 0) {
      const product = products.find((p) => p.id === firstExpiry.productId)
      if (product) {
        setSelectedProducts([product])

        const pid = firstExpiry.productId

        if (firstExpiry.startDate) {
          setProductStartDate((prev) => ({
            ...prev,
            [pid]: addDays(firstExpiry.endDate, 1),
          }))
        }

        setExpiredName((prev) => ({
          ...prev,
          [pid]: accountData?.accountName || '',
        }))
      }
    }
  }, [open, accountData, products])

  const handleExpiryChange = (productId, key, value) => {
    setExpiryDurations((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { value: '1', unit: 'month' }),
        [key]: value,
      },
    }))
  }

  const form = useForm({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      schoolId: '',
      customerId: accountData?.customerId.toString() || '',
      status: 'pending',
      note: '',
      revenueSharing: null,
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
    },
  })

  const onSubmit = async (data) => {
    const items = selectedProducts.map((product) => {
      const expiry = expiryDurations[product.id] || {}
      const startDate = productStartDate[product.id]
        ? new Date(productStartDate[product.id]).toISOString()
        : null

      return {
        productId: product.id,
        productName: product.name,
        productType: product.type,
        unitId: product.prices[0].unitId,
        unitName: product.prices[0].unitName,
        giveaway: giveaway[product.id] || 0,
        quantity: quantities[product.id] || 1,
        price: product.price,
        discount: discounts[product.id] || 0,
        taxAmount: calculateTaxForProduct(product.id),
        subTotal: calculateSubTotal(product.id),
        total:
          calculateSubTotal(product.id) + calculateTaxForProduct(product.id),
        applyWarranty: !!applyWarrantyItems[product.id],
        periodMonths:
          applyWarrantyItems[product.id] && product.warrantyPolicy
            ? product.warrantyPolicy.periodMonths
            : 0,
        conditions:
          applyWarrantyItems[product.id] && product.warrantyPolicy
            ? product.warrantyPolicy.conditions
            : '',
        warrantyCost:
          applyWarrantyItems[product.id] && product.warrantyPolicy
            ? product.warrantyPolicy.warrantyCost
            : 0,
        startDate,
        note: notes[product.id] || '',
        expiryDuration: expiry.value || null,
        expiryUnit: expiry.unit || 'month',
        accountId: accountData.id?.toString() || '',
        accountName: accountData.accountName || '',
        applyExpiry: true,
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
    // console.log(dataToSend)
    // return
    try {
      const invoice = await dispatch(createInvoice(dataToSend)).unwrap()
      if (hasPrintInvoice) {
        const getAdminInvoice = JSON.parse(
          localStorage.getItem('permissionCodes'),
        ).includes('GET_INVOICE')

        const invoiceId = invoice.id
        const invoiceData = getAdminInvoice
          ? await getInvoiceDetail(invoiceId)
          : await getInvoiceDetailByUser(invoiceId)

        setInvoice(invoiceData)

        const generalInformationData = await dispatch(
          getSetting('general_information'),
        ).unwrap()
        setGeneralInformation(generalInformationData)

        setTimeout(() => {
          setInvoice(null)
          form.reset()
          onOpenChange?.(false)
          dispatch(getExpiry()).unwrap()
        }, 1000)
      } else {
        form.reset()
        onOpenChange?.(false)
        await dispatch(getExpiry()).unwrap()
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

    setProductStartDate((prev) => {
      const updated = {}
      for (const id of productIds) {
        const expiry = accountData?.expiries?.find((e) => e.productId === id)
        updated[id] = expiry?.endDate ? addDays(expiry.endDate, 1) : null
      }
      return updated
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

  const calculateSubTotal = (productId) => {
    const quantity = quantities[productId] || 1
    const product = selectedProducts.find((prod) => prod.id === productId)
    const discount = discounts[productId] || 0
    const subtotal = quantity * product.price
    return subtotal - discount > 0 ? subtotal - discount : 0
  }

  const handleDiscountChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setDiscounts((prev) => ({
      ...prev,
      [productId]: numericValue,
    }))
  }

  const handlePriceChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, price: numericValue }
          : product,
      ),
    )
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
      const subtotal = quantity * product.price
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
    const basePrice = product.price * quantity
    const selectedProductTaxes = selectedTaxes[productId] || []

    const taxAmount = product.prices[0].taxes
      .filter((tax) => selectedProductTaxes.includes(tax.id))
      .reduce((sum, tax) => sum + (basePrice * tax.percentage) / 100, 0)

    return taxAmount
  }

  const handleCalculateSubTotalInvoice = () => {
    return selectedProducts.reduce((subTotal, product) => {
      const basePrice = product?.price || 0
      const quantity = quantities[product.id] || 1
      const total = basePrice * quantity
      return subTotal + total
    }, 0)
  }

  const handleApplyWarrantyChange = (productId, checked) => {
    setApplyWarrantyItems((prev) => ({
      ...prev,
      [productId]: !!checked,
    }))
  }

  const handleCreateReceipt = () => {
    setIsCreateReceipt((prev) => !prev)
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
  // Phần thêm chi phí khác
  const handleSetOtherExpenses = (data) => {
    setOtherExpenses(data)
  }
  const calculateExpenses = () => {
    const totalExpenses = otherExpenses.price
    return totalExpenses
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
            <DialogTitle>
              Thêm hóa đơn gia hạn cho {accountData.accountName}
            </DialogTitle>
            <DialogDescription>
              Hoàn thành các thông tin dưới đây để có thể thêm hóa đơn gia hạn
              mới
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
            <Form {...form}>
              <form id="create-invoice" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="flex-1 space-y-6 rounded-lg border p-4 lg:max-w-[79vw]">
                    <h2 className="text-lg font-semibold">Thông tin đơn</h2>
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
                                {/* <TableHead className="min-w-16">ĐVT</TableHead> */}
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
                                <TableHead className="min-w-28">
                                  Tài khoản
                                </TableHead>
                                <TableHead className="min-w-28">
                                  Ngày gia hạn
                                </TableHead>
                                <TableHead className="min-w-32">
                                  Thời hạn
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedProducts.map((product, index) => (
                                <TableRow key={product.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {product.name}
                                      </div>
                                      <span className="break-words text-xs text-muted-foreground">
                                        {`ĐVT: ${product?.prices[0]?.unitName}` ||
                                          ''}
                                      </span>
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
                                      min={0}
                                      className="h-7 w-full"
                                      onChange={(e) =>
                                        handleGiveawayChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="text-end">
                                    <Input
                                      value={moneyFormat(product.price)}
                                      placeholder="0"
                                      className="h-7 w-24 text-end"
                                      onChange={(e) =>
                                        handlePriceChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      control={form.control}
                                      name="taxes"
                                      render={() => (
                                        <FormItem>
                                          {product?.prices[0]?.taxes.map(
                                            (tax) => (
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
                                            ),
                                          )}
                                        </FormItem>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={
                                        discounts[product.id]
                                          ? moneyFormat(discounts[product.id])
                                          : ''
                                      }
                                      placeholder="0"
                                      className="h-7 w-full text-end"
                                      onChange={(e) =>
                                        handleDiscountChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="text-end">
                                    {moneyFormat(calculateSubTotal(product.id))}
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
                                          {product.warrantyPolicy.periodMonths}{' '}
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

                                  {(type === 'digital' ||
                                    type === 'physical') && (
                                    <>
                                      <TableCell className="text-end">
                                        <Input
                                          value={expiredName[product.id] || ''}
                                          onChange={(e) =>
                                            handleExpiredNameChange(
                                              product.id,
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Tài khoản"
                                          type="text"
                                          className="h-7 w-full"
                                          disabled={true}
                                        />
                                      </TableCell>

                                      <TableCell className="text-end">
                                        <Popover>
                                          <PopoverTrigger asChild>
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
                                                : 'Chọn'}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                          >
                                            <DatePicker
                                              mode="single"
                                              captionLayout="dropdown-buttons"
                                              fromYear={2018}
                                              toYear={2035}
                                              selected={
                                                productStartDate[product.id]
                                              }
                                              onSelect={(date) =>
                                                handleStartDateChange(
                                                  product.id,
                                                  date,
                                                )
                                              }
                                              initialFocus
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </TableCell>

                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="number"
                                            min={1}
                                            className="h-7 w-16"
                                            placeholder="Thời hạn"
                                            value={
                                              expiryDurations[product.id]
                                                ?.value || '1'
                                            }
                                            onChange={(e) =>
                                              handleExpiryChange(
                                                product.id,
                                                'value',
                                                Number(e.target.value),
                                              )
                                            }
                                          />

                                          <Select
                                            value={
                                              expiryDurations[product.id]
                                                ?.unit || 'month'
                                            }
                                            onValueChange={(v) =>
                                              handleExpiryChange(
                                                product.id,
                                                'unit',
                                                v,
                                              )
                                            }
                                          >
                                            <SelectTrigger className="h-7 w-20">
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
                                      </TableCell>
                                    </>
                                  )}
                                </TableRow>
                              ))}
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
                        disabled={!!accountData?.expiries?.length}
                        onChange={(value) => handleSelectProduct(value)}
                        options={products
                          .filter((product) => {
                            const alreadySelected = selectedProducts.some(
                              (selected) => selected.id === product.id,
                            )
                            if (alreadySelected) return false

                            if (type === 'digital') {
                              return (
                                product.type === 'digital' &&
                                product.categoryId !== 1 &&
                                product.categoryId !== 17
                              )
                            }
                            return product.type === type
                          })
                          .map((product) => ({
                            label: `${product.name} - ${moneyFormat(product.price)} - (hệ số: ${product.coefficient.coefficient})`,
                            value: product.id,
                          }))}
                        placeholder="Tìm kiếm sản phẩm"
                        value={selectedProducts.map((product) => ({
                          label: `${product.name} - ${moneyFormat(product.price)} - (hệ số: ${product.coefficient.coefficient})`,
                          value: product.id,
                        }))}
                      />

                      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
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
                          {/* Phần chi phí khác */}
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
                          {/* Hết phần chi phí khác */}

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

                      {selectedCustomer && !accountData?.customerId && (
                        <div
                          className="h-5 w-5 cursor-pointer text-destructive"
                          title="Chọn lại"
                        >
                          <X
                            className="h-5 w-5"
                            onClick={() => {
                              setSelectedCustomer(null)
                              form.setValue('customerId', null)
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
                                              onSelect={() => {
                                                form.setValue(
                                                  'customerId',
                                                  customer.id.toString(),
                                                )
                                                form.trigger('customerId')
                                                setSelectedCustomer(customer)
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
                        <div className="mb-3">
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
    </>
  )
}

export default CreateInvoiceWithExpiryDialog
