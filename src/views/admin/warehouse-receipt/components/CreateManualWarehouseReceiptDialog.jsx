import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { createWarehouseReceipt, getWarehouseReceipts } from '@/stores/WarehouseReceiptSlice'
import { PlusIcon, Trash2, Check, ChevronsUpDown, Search } from 'lucide-react'
import { toast } from 'sonner'
import { receiptTypes, businessTypes } from '../data'
import { moneyFormat } from '@/utils/money-format'

const formSchema = z.object({
  receiptType: z.coerce.number(),
  businessType: z.string().min(1, 'Vui lòng chọn loại nghiệp vụ'),
  receiptDate: z.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
})

const CreateManualWarehouseReceiptDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()
  const { products, loading: productsLoading } = useSelector((state) => state.product)
  const [loading, setLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [openProductSearch, setOpenProductSearch] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiptType: 1, // Default: Import
      businessType: '',
      receiptDate: new Date(),
      reason: '',
      note: '',
    },
  })

  const receiptType = form.watch('receiptType')

  // Filter business types based on receipt type
  const filteredBusinessTypes = useMemo(() => {
    // 1: Import, 2: Export, 3: Adjustment
    if (receiptType === 1) {
      return businessTypes.filter(t => ['purchase_in', 'return_in', 'other', 'transfer_in'].includes(t.value))
    }
    if (receiptType === 2) {
      return businessTypes.filter(t => ['sale_out', 'return_out', 'other', 'transfer_out'].includes(t.value))
    }
    if (receiptType === 3) {
      return businessTypes.filter(t => ['adjustment'].includes(t.value))
    }
    return []
  }, [receiptType])

  useEffect(() => {
    // Reset business type when receipt type changes
    form.setValue('businessType', '')

    // Default business type selection
    if (receiptType === 3) {
      form.setValue('businessType', 'adjustment')
    } else {
      form.setValue('businessType', 'other')
    }
  }, [receiptType, form])

  useEffect(() => {
    if (open && products.length === 0) {
      dispatch(getProducts())
    }
  }, [open, dispatch, products.length])

  const handleAddProduct = (product) => {
    if (selectedProducts.some(p => p.productId === product.id)) {
      toast.warning('Sản phẩm này đã được chọn')
      return
    }

    const baseUnitId = product.baseUnitId || product.prices?.[0]?.unitId
    // Default movement based on receipt type
    let defaultMovement = 'in'
    if (receiptType === 2) defaultMovement = 'out' // Export
    // Adjustment defaults to 'in' (surplus) initially, user can change

    setSelectedProducts(prev => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        code: product.code,
        image: product.image,
        unitId: baseUnitId,
        unitName: product.baseUnit?.name || product.prices?.[0]?.unitName || '—',
        quantity: 1,
        price: product.price || 0, // Default to selling price, user might need to change for import cost
        movement: defaultMovement,
        note: '',
        product: product // Keep full product ref for unit conversion lookup
      }
    ])
    setOpenProductSearch(false)
  }

  const handleRemoveProduct = (index) => {
    const newProducts = [...selectedProducts]
    newProducts.splice(index, 1)
    setSelectedProducts(newProducts)
  }

  const handleProductChange = (index, field, value) => {
    const newProducts = [...selectedProducts]
    newProducts[index][field] = value

    // Handle Unit Change -> Update Factor/Price logic could go here if needed
    if (field === 'unitId') {
      const product = newProducts[index].product
      // Simple find unit name for display
      const unit = product?.unitConversions?.find(u => u.unitId === value) ||
        (Number(product.baseUnitId) === Number(value) ? { unit: product.baseUnit } : null) ||
        product?.prices?.find(p => p.unitId === value)

      if (unit) {
        newProducts[index].unitName = unit.unitName || unit.unit?.name || '—'
      }
    }

    setSelectedProducts(newProducts)
  }

  const onSubmit = async (data) => {
    if (selectedProducts.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm')
      return
    }

    setLoading(true)
    try {
      const details = selectedProducts.map(item => ({
        productId: item.productId,
        unitId: item.unitId,
        movement: receiptType === 3 ? item.movement : (receiptType === 1 ? 'in' : 'out'),
        qtyActual: item.quantity,
        unitPrice: item.price,
        note: item.note
      }))

      const payload = {
        receiptType: data.receiptType,
        businessType: data.businessType,
        receiptDate: data.receiptDate.toISOString(),
        reason: data.reason,
        note: data.note,
        details: details
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Tạo phiếu kho thành công')

      // Reset & Refresh
      form.reset()
      setSelectedProducts([])
      onOpenChange(false)
      dispatch(getWarehouseReceipts())
    } catch (error) {
      console.error(error)
      // Toast error is handled in slice usually, but safety net:
      toast.error(error?.message || 'Tạo phiếu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const getUnitOptions = (product) => {
    if (!product) return []
    const opts = []

    // Base unit
    if (product.baseUnitId) {
      opts.push({
        value: product.baseUnitId,
        label: product.baseUnit?.name || 'Đơn vị cơ bản'
      })
    } else if (product.prices?.[0]?.unitId) {
      opts.push({
        value: product.prices[0].unitId,
        label: product.prices[0].unitName
      })
    }

    // Conversions
    if (product.unitConversions) {
      product.unitConversions.forEach(uc => {
        if (uc.unitId && uc.unitId !== product.baseUnitId) {
          opts.push({
            value: uc.unitId,
            label: uc.unit?.name || '—'
          })
        }
      })
    }

    // Dedupe
    return opts.filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <PlusIcon className="mr-2 h-4 w-4" />
            Tạo phiếu
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Tạo phiếu kho thủ công</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="receiptType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại phiếu</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {receiptTypes.map(t => (
                          <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại nghiệp vụ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nghiệp vụ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredBusinessTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col space-y-2">
                <FormLabel>Ngày tạo</FormLabel>
                <Input
                  type="date"
                  value={form.watch('receiptDate').toISOString().split('T')[0]}
                  onChange={(e) => form.setValue('receiptDate', new Date(e.target.value))}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do / Diễn giải</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ví dụ: Nhập kho hàng trả lại" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Chi tiết hàng hóa</h3>
                <Popover open={openProductSearch} onOpenChange={setOpenProductSearch}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-[250px] justify-between">
                      <Search className="mr-2 h-4 w-4 opacity-50" />
                      Thêm sản phẩm...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="end">
                    <Command shouldFilter={false}> {/* Client side filtering manually if needed, or rely on command default */}
                      <CommandInput placeholder="Tìm kiếm sản phẩm..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                        <CommandGroup heading="Sản phẩm">
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name + ' ' + product.code} // Searchable string
                              onSelect={() => handleAddProduct(product)}
                            >
                              <div className='flex flex-col'>
                                <span>{product.name}</span>
                                <span className='text-xs text-muted-foreground'>{product.code} - Tồn: {product.productStocks?.[0]?.quantity || 0}</span>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedProducts.some(p => p.productId === product.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="w-[100px]">ĐVT</TableHead>
                      {receiptType === 3 && <TableHead className="w-[120px]">Điều chỉnh</TableHead>}
                      <TableHead className="w-[100px]">Số lượng</TableHead>
                      <TableHead className="w-[150px]">Đơn giá</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={receiptType === 3 ? 8 : 7} className="text-center h-24 text-muted-foreground">
                          Chưa có sản phẩm nào được chọn
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedProducts.map((item, index) => (
                        <TableRow key={item.productId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">{item.code}</div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={String(item.unitId)}
                              onValueChange={(val) => handleProductChange(index, 'unitId', Number(val))}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getUnitOptions(item.product).map(u => (
                                  <SelectItem key={u.value} value={String(u.value)}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {receiptType === 3 && (
                            <TableCell>
                              <Select
                                value={item.movement}
                                onValueChange={(val) => handleProductChange(index, 'movement', val)}
                              >
                                <SelectTrigger className={cn("h-8 font-medium", item.movement === 'in' ? 'text-blue-600' : 'text-orange-600')}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in" className="text-blue-600">Thừa (Nhập)</SelectItem>
                                  <SelectItem value="out" className="text-orange-600">Thiếu (Xuất)</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )}

                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              className="h-8"
                              value={item.quantity}
                              onChange={(e) => handleProductChange(index, 'quantity', Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-8 text-right"
                              // value={moneyFormat(item.price)} // Using raw value for edit
                              value={item.price}
                              type="number"
                              onChange={(e) => handleProductChange(index, 'price', Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-8"
                              value={item.note}
                              onChange={(e) => handleProductChange(index, 'note', e.target.value)}
                              placeholder="Ghi chú..."
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveProduct(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú chung</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Ghi chú thêm..." />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="submit" loading={loading}>Lưu phiếu</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateManualWarehouseReceiptDialog
