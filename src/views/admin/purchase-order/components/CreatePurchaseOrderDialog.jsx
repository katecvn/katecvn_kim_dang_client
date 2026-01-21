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
import { CheckIcon, Mail, MapPin, Plus, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getSuppliers } from '@/stores/SupplierSlice'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { createPurchaseOrderSchema } from '../schema'
import { createPurchaseOrder } from '@/stores/PurchaseOrderSlice'
import { toast } from 'sonner'
import { paymentMethods } from '../../receipt/data'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CaretSortIcon, MobileIcon } from '@radix-ui/react-icons'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'
import MultipleSelector from '@/components/custom/MultiSelector'
import { attributes, productTypeMap, statuses } from '../data'
import { DatePicker } from '@/components/custom/DatePicker'

const CreatePurchaseOrderDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  const suppliers = useSelector((state) => state.supplier.suppliers)
  const loading = useSelector((state) => state.purchaseOrder.loading)
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}

  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedUnitIds, setSelectedUnitIds] = useState({})
  const [baseUnitPrices, setBaseUnitPrices] = useState({})
  const [priceOverrides, setPriceOverrides] = useState({})
  const [discounts, setDiscounts] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState({})
  const [totalAmount, setTotalAmount] = useState('')
  const [selectedTaxes, setSelectedTaxes] = useState({})

  const form = useForm({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      orderDate: new Date(),
      status: 'draft',
      note: '',
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
      expectedDeliveryDate: null,
      paymentTerms: '',
      bankAccount: null
    },
  })

  useEffect(() => {
    if (open) {
      dispatch(getProducts())
      dispatch(getSuppliers())
    }
  }, [dispatch, open])

  useEffect(() => {
    if (open) return
    setSelectedProducts([])
    setSelectedUnitIds({})
    setBaseUnitPrices({})
    setPriceOverrides({})
    setDiscounts({})
    setQuantities({})
    setNotes({})
    setSelectedTaxes({})
    setSelectedSupplier(null)
    setTotalAmount('')
    form.reset()
  }, [open, form])

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

      if (priceOverrides[pid] != null) return Number(priceOverrides[pid] || 0)

      const basePrice = Number(baseUnitPrices[pid] ?? product?.price ?? 0)
      return factor > 0 ? basePrice / factor : basePrice
    },
    [baseUnitPrices, priceOverrides, selectedUnitIds, getFactor],
  )

  const onSubmit = async (data) => {
    const items = selectedProducts.map((product, index) => {
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
        lineNo: index + 1,
        productId: product.id,
        productCode: product.code || '',
        image: product.image,
        productName: product.name,
        productType: product.type,
        unitId,
        unitName,
        quantity: qtyUnit,
        receivedQuantity: 0,
        baseQuantity: qtyBase,
        conversionFactor: factor,
        unitPrice: priceUnit,
        taxAmount: calculateTaxForProduct(product.id),
        subTotal: calculateSubTotal(product.id),
        discount: discounts[product.id] || 0,
        total: calculateSubTotal(product.id) + calculateTaxForProduct(product.id),
        note: notes[product.id] || '',
      }
    })

    const dataToSend = {
      supplierId: data.supplierId,
      orderDate: data.orderDate ? data.orderDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDeliveryDate: data.expectedDeliveryDate ? data.expectedDeliveryDate.toISOString().split('T')[0] : null,
      note: data.note,
      taxAmount: calculateTotalTax(),
      amount: calculateTotalAmount(),
      discount: calculateTotalDiscount(),
      subTotal: handleCalculateSubTotalInvoice(),
      totalAmount: calculateTotalAmount(),
      status: data.status,
      paymentStatus: 'unpaid',
      paidAmount: 0,
      items,
      paymentMethod: data.paymentMethod,
      paymentNote: data.paymentNote,
      paymentTerms: data.paymentTerms,
      createdBy: authUserWithRoleHasPermissions.id,
      updatedBy: authUserWithRoleHasPermissions.id,
    }

    try {
      await dispatch(createPurchaseOrder(dataToSend)).unwrap()
      form.reset()
      onOpenChange?.(false)
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

    setSelectedUnitIds((prev) => {
      const next = { ...prev }
      for (const p of selectProductDetails) {
        if (!next[p.id]) {
          next[p.id] = getBaseUnitId(p) || p?.prices?.[0]?.unitId
        }
      }
      for (const k of Object.keys(next)) {
        if (!productIds.includes(Number(k))) delete next[k]
      }
      return next
    })

    setBaseUnitPrices((prev) => {
      const next = { ...prev }
      for (const p of selectProductDetails) {
        if (next[p.id] == null) next[p.id] = Number(p.price || 0)
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

  const handlePriceChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setPriceOverrides((prev) => ({
      ...prev,
      [productId]: numericValue,
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
    const total = calculateInvoiceTotal() + calculateTotalTax()
    return total
  }

  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    form.setValue('supplierId', supplier?.id.toString())
  }

  const getProductTypeLabel = (type) => productTypeMap[type] || type

  // Popular products for quick select
  const popularProducts = useMemo(() => {
    if (!products || products.length === 0) return []
    return products.filter(p => 1 > 0).slice(0, 15)
  }, [products])

  const handleQuickSelectProduct = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id)

    if (isAlreadySelected) {
      const newSelectedProducts = selectedProducts.filter(p => p.id !== product.id)
      setSelectedProducts(newSelectedProducts)

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
      handleSelectProduct([...selectedProducts.map(p => ({ value: p.id, label: p.name })), { value: product.id, label: product.name }])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-full">
        <DialogHeader>
          <DialogTitle>Tạo đơn đặt hàng mới</DialogTitle>
          <DialogDescription>
            Hoàn thành các thông tin dưới đây để có thể thêm đơn đặt hàng mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-purchase-order" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6 lg:flex-row">
                {/* Main Content */}
                <div className="flex-1 space-y-6 rounded-lg border p-4 lg:max-w-[79vw]">
                  <h2 className="text-lg font-semibold">Thông tin đơn đặt hàng</h2>

                  <div className="space-y-6">
                    {/* Products Table */}
                    {selectedProducts.length > 0 && (
                      <div className="overflow-x-auto rounded-lg border">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="bg-secondary text-xs">
                              <TableHead className="w-8">TT</TableHead>
                              <TableHead className="min-w-40">Sản phẩm</TableHead>
                              <TableHead className="min-w-16">SL</TableHead>
                              <TableHead className="min-w-24">ĐVT</TableHead>
                              <TableHead className="min-w-20">Giá</TableHead>
                              <TableHead className="min-w-20">Thuế</TableHead>
                              <TableHead className="min-w-28">Giảm giá</TableHead>
                              <TableHead className="min-w-28">Tổng cộng</TableHead>
                              <TableHead className="min-w-28">Ghi chú</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedProducts.map((product, index) => {
                              const unitId =
                                selectedUnitIds[product.id] ||
                                getBaseUnitId(product) ||
                                product?.prices?.[0]?.unitId
                              const unitOptions = getUnitOptions(product)

                              return (
                                <TableRow key={product.id}>
                                  <TableCell>{index + 1}</TableCell>

                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{product.name}</div>
                                      <span className="break-words text-xs text-muted-foreground">
                                        {`ĐVT gốc: ${getBaseUnitName(product)}`}
                                      </span>

                                      {Array.isArray(product?.unitConversions) &&
                                        product.unitConversions.length > 0 && (
                                          <div className="mt-1 break-words text-[11px] text-muted-foreground">
                                            Quy đổi:{' '}
                                            {product.unitConversions
                                              .map((c) => {
                                                const f = Number(c?.conversionFactor || 0)
                                                const u = c?.unit?.name || '—'
                                                return f > 0
                                                  ? `1 ${getBaseUnitName(product)} = ${f} ${u}`
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
                                        handleQuantityChange(product.id, e.target.value)
                                      }
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Select
                                      value={unitId?.toString()}
                                      onValueChange={(val) => {
                                        setSelectedUnitIds(prev => ({ ...prev, [product.id]: Number(val) }))
                                        setPriceOverrides(prev => {
                                          const next = { ...prev }
                                          delete next[product.id]
                                          return next
                                        })
                                      }}
                                    >
                                      <SelectTrigger className="h-7 w-28">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {unitOptions.map((opt) => (
                                          <SelectItem key={opt.unitId} value={opt.unitId.toString()}>
                                            {opt.unitName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>

                                  <TableCell className="text-end">
                                    <MoneyInputQuick
                                      value={getDisplayPrice(product) ?? 0}
                                      onChange={(num) => handlePriceChange(product.id, String(num))}
                                      placeholder="0"
                                      className="h-7 w-24"
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      {product?.prices?.[0]?.taxes?.map((tax) => {
                                        const isChecked = selectedTaxes[product.id]?.includes(tax.id)
                                        return (
                                          <div key={tax.id} className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(e) => handleTaxChange(product.id, tax.id, e.target.checked)}
                                              className="h-4 w-4"
                                            />
                                            <span className="text-xs">{tax.code} ({tax.percentage}%)</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </TableCell>

                                  <TableCell>
                                    <MoneyInputQuick
                                      value={discounts[product.id] ?? 0}
                                      onChange={(num) => handleDiscountChange(product.id, String(num))}
                                      placeholder="0"
                                      className="h-7 w-24"
                                    />
                                  </TableCell>

                                  <TableCell className="text-end font-medium">
                                    {moneyFormat(
                                      calculateSubTotal(product.id) + calculateTaxForProduct(product.id)
                                    )}
                                  </TableCell>

                                  <TableCell className="text-end">
                                    <Textarea
                                      onChange={(e) => handleNoteChange(product.id, e.target.value)}
                                      placeholder="Ghi chú"
                                      rows={1}
                                      type="text"
                                      className="h-7 w-full"
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Product Selector */}
                    <MultipleSelector
                      emptyIndicator={
                        <p className="text-center text-xs leading-10 text-muted-foreground">
                          Không có kết quả nào được tìm thấy
                        </p>
                      }
                      hidePlaceholderWhenSelected={true}
                      onChange={(value) => handleSelectProduct(value)}
                      options={products.map((product) => ({
                        label: `${product.name} - ${moneyFormat(product.price)} - (Loại: ${getProductTypeLabel(product.type)}, ĐVT gốc: ${getBaseUnitName(product)}, Tồn: ${product?.productStocks?.[0]?.quantity || 0})`,
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
                            const isSelected = selectedProducts.some((p) => p.id === product.id)
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
                                {isSelected && (
                                  <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <CheckIcon className="h-3 w-3" />
                                  </div>
                                )}

                                <div className="w-full pr-6">
                                  <p className="line-clamp-2 text-xs font-medium leading-tight">
                                    {product.name}
                                  </p>
                                </div>

                                <div className="flex w-full flex-col gap-0.5">
                                  <p className="text-xs font-semibold text-primary">
                                    {moneyFormat(product.price)}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    Tồn: {stock}
                                  </p>
                                </div>

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

                    {/* Summary and Note */}
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

                        <div className="flex justify-between border-t py-2">
                          <div className="text-sm font-bold">Tổng số tiền:</div>
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

                {/* Supplier Info Sidebar */}
                <div className="w-full rounded-lg border p-4 lg:w-72">
                  <div className="flex items-center justify-between">
                    <h2 className="py-2 text-lg font-semibold">
                      Nhà cung cấp
                    </h2>

                    {selectedSupplier && (
                      <div
                        className="h-5 w-5 cursor-pointer text-destructive"
                        title="Chọn lại"
                      >
                        <X
                          className="h-5 w-5"
                          onClick={() => {
                            setSelectedSupplier(null)
                            form.setValue('supplierId', null)
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {selectedSupplier ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedSupplier?.name}`}
                            alt={selectedSupplier?.name}
                          />
                          <AvatarFallback>NCC</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedSupplier?.name}</div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-medium">
                            Thông tin nhà cung cấp
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          {selectedSupplier?.phone && (
                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4">
                                <MobileIcon className="h-4 w-4" />
                              </div>
                              <a href={`tel:${selectedSupplier?.phone}`}>
                                {selectedSupplier?.phone}
                              </a>
                            </div>
                          )}

                          {selectedSupplier?.email && (
                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4">
                                <Mail className="h-4 w-4" />
                              </div>
                              <a href={`mailto:${selectedSupplier?.email}`}>
                                {selectedSupplier?.email}
                              </a>
                            </div>
                          )}

                          {selectedSupplier?.address && (
                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4">
                                <MapPin className="h-4 w-4" />
                              </div>
                              {selectedSupplier?.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                          <FormItem className="mb-2 space-y-1">
                            <FormLabel required={true}>Nhà cung cấp</FormLabel>
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
                                      ? suppliers.find(
                                        (supplier) =>
                                          supplier.id === field.value,
                                      )?.name
                                      : 'Chọn nhà cung cấp'}
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
                                      {suppliers &&
                                        suppliers.map((supplier) => (
                                          <CommandItem
                                            value={supplier.id}
                                            key={supplier.id}
                                            onSelect={() => {
                                              handleSelectSupplier(supplier)
                                            }}
                                          >
                                            {supplier.name} - {supplier.phone}
                                            <CheckIcon
                                              className={cn(
                                                'ml-auto h-4 w-4',
                                                supplier.id === field.value
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
                    </>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    {/* Ngày đặt hàng */}
                    <FormField
                      control={form.control}
                      name="orderDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel required={true}>Ngày đặt hàng</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value
                                    ? field.value.toLocaleDateString('vi-VN')
                                    : 'Chọn ngày đặt hàng'}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <DatePicker
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Ngày dự kiến giao hàng */}
                    <FormField
                      control={form.control}
                      name="expectedDeliveryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày dự kiến giao hàng</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value
                                    ? field.value.toLocaleDateString('vi-VN')
                                    : 'Chọn ngày giao hàng'}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <DatePicker
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trạng thái</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phương thức thanh toán</FormLabel>
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
                              {paymentMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
              }}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="create-purchase-order" loading={loading}>
            Tạo đơn hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePurchaseOrderDialog