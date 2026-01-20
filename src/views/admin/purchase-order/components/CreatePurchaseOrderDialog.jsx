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
import { moneyFormat } from '@/utils/money-format'
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
      status: 'pending',
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
      return factor > 0 ? basePrice * factor : basePrice
    },
    [baseUnitPrices, priceOverrides, selectedUnitIds, getFactor],
  )

  const onSubmit = async (data) => {
    const items = selectedProducts.map((product) => {
      const unitId =
        selectedUnitIds[product.id] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const unitName = getUnitNameById(product, unitId)
      const factor = getFactor(product, unitId)

      const qtyUnit = quantities[product.id] || 1
      const qtyBase = factor > 0 ? qtyUnit * factor : qtyUnit

      const priceUnit = getDisplayPrice(product)

      return {
        productId: product.id,
        image: product.image,
        productName: product.name,
        productType: product.type,
        unitId,
        unitName,
        quantity: qtyUnit,
        baseQuantity: qtyUnit,
        conversionFactor: factor,
        price: priceUnit,
        taxAmount: calculateTaxForProduct(product.id),
        subTotal: calculateSubTotal(product.id),
        discount: discounts[product.id] || 0,
        total: calculateSubTotal(product.id) + calculateTaxForProduct(product.id),
        note: notes[product.id] || '',
      }
    })

    const dataToSend = {
      userId: authUserWithRoleHasPermissions.id,
      supplierId: data.supplierId,
      date: new Date().toISOString(),
      note: data.note,
      taxAmount: calculateTotalTax(),
      amount: calculateTotalAmount(),
      discount: calculateTotalDiscount(),
      subTotal: handleCalculateSubTotalInvoice(),
      status: data.status,
      items,
      paymentMethod: data.paymentMethod,
      paymentNote: data.paymentNote,
      totalAmount: calculateTotalAmount(),
      expectedDeliveryDate: data.expectedDeliveryDate,
      paymentTerms: data.paymentTerms,
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
                    <FormItem className="flex flex-col">
                      <FormLabel>Nhà cung cấp (*)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-full justify-between',
                              !selectedSupplier && 'text-muted-foreground',
                            )}
                          >
                            {selectedSupplier
                              ? selectedSupplier.name
                              : 'Chọn nhà cung cấp'}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Tìm nhà cung cấp..." />
                            <CommandList>
                              <CommandEmpty>Không tìm thấy.</CommandEmpty>
                              <CommandGroup>
                                {suppliers.map((supplier) => (
                                  <CommandItem
                                    key={supplier.id}
                                    value={supplier.name}
                                    onSelect={() => handleSelectSupplier(supplier)}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        selectedSupplier?.id === supplier.id
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    {supplier.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>

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
                              <SelectItem value="pending">Chờ duyệt</SelectItem>
                              <SelectItem value="approved">Đã duyệt</SelectItem>
                              <SelectItem value="completed">Hoàn thành</SelectItem>
                              <SelectItem value="cancelled">Đã hủy</SelectItem>
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

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghi chú</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Ghi chú đơn hàng" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Products Section */}
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Sản phẩm</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            Thêm sản phẩm...
                            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Tìm sản phẩm..." />
                            <CommandList>
                              <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                              <CommandGroup>
                                {products.map((product) => {
                                  const isSelected = selectedProducts.some(p => p.id === product.id)
                                  if (isSelected) return null

                                  return (
                                    <CommandItem
                                      key={product.id}
                                      value={product.name}
                                      onSelect={() => {
                                        handleSelectProduct([
                                          ...selectedProducts.map(p => ({ value: p.id, label: p.name })),
                                          { value: product.id, label: product.name }
                                        ])
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={product.image} />
                                          <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{product.name}</span>
                                      </div>
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>

                    <div className="overflow-x-auto rounded-lg border">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-secondary text-xs">
                            <TableHead className="w-8"></TableHead>
                            <TableHead className="min-w-40">Sản phẩm</TableHead>
                            <TableHead className="min-w-24">ĐVT</TableHead>
                            <TableHead className="min-w-20">SL</TableHead>
                            <TableHead className="min-w-20">Giá</TableHead>
                            <TableHead className="min-w-20">Chiết khấu</TableHead>
                            <TableHead className="min-w-16">Thuế</TableHead>
                            <TableHead className="min-w-28 text-right">
                              Thành tiền
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProducts.map((product) => {
                            const unitId =
                              selectedUnitIds[product.id] ||
                              getBaseUnitId(product) ||
                              product?.prices?.[0]?.unitId
                            const unitOptions = getUnitOptions(product)

                            return (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newSelected = selectedProducts.filter(p => p.id !== product.id)
                                      handleSelectProduct(newSelected.map(p => ({ value: p.id })))
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={product.image} />
                                      <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                      <span className="font-medium">{product.name}</span>
                                      <Input
                                        className="h-6 w-full mt-1 text-xs"
                                        placeholder="Ghi chú..."
                                        value={notes[product.id] || ''}
                                        onChange={(e) => handleNoteChange(product.id, e.target.value)}
                                      />
                                    </div>
                                  </div>
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
                                    <SelectTrigger className="h-8">
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
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    className="h-8"
                                    value={quantities[product.id] || 1}
                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="h-8 text-right"
                                    value={moneyFormat(getDisplayPrice(product))}
                                    onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="h-8 text-right"
                                    value={moneyFormat(discounts[product.id] || 0)}
                                    onChange={(e) => handleDiscountChange(product.id, e.target.value)}
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
                                <TableCell className="text-right font-medium">
                                  {moneyFormat(
                                    calculateSubTotal(product.id) + calculateTaxForProduct(product.id)
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {selectedProducts.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                Chưa chọn sản phẩm nào
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end">
                      <div className="w-[300px] space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tổng tiền hàng:</span>
                          <span>{moneyFormat(handleCalculateSubTotalInvoice())}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Chiết khấu:</span>
                          <span>{moneyFormat(calculateTotalDiscount())}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Thuế:</span>
                          <span>{moneyFormat(calculateTotalTax())}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Tổng cộng:</span>
                          <span>{moneyFormat(calculateTotalAmount())}</span>
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
                  </div>

                  {selectedSupplier && (
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
                              <div className="mr-2 h-4 w-4 ">
                                <MobileIcon className="h-4 w-4" />
                              </div>
                              <a href={`tel:${selectedSupplier?.phone}`}>
                                {selectedSupplier?.phone}
                              </a>
                            </div>
                          )}

                          {selectedSupplier?.email && (
                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <Mail className="h-4 w-4" />
                              </div>
                              <a href={`mailto:${selectedSupplier?.email}`}>
                                {selectedSupplier?.email}
                              </a>
                            </div>
                          )}

                          {selectedSupplier?.address && (
                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <MapPin className="h-4 w-4" />
                              </div>
                              {selectedSupplier?.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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