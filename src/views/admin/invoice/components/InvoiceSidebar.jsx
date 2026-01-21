import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/custom/Button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { CheckIcon, Mail, MapPin, User, Calendar, FileText, Printer } from 'lucide-react'
import { MobileIcon, CaretSortIcon } from '@radix-ui/react-icons'
import { IconDatabasePlus, IconFileTypePdf } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createCustomer } from '@/stores/CustomerSlice'
import { toast } from 'sonner'
import { DatePicker } from '@/components/custom/DatePicker'

const InvoiceSidebar = ({
  form,
  customers,
  selectedCustomer,
  onSelectCustomer,
  paymentMethods,
  calculateSubTotal,
  calculateTotalTax,
  calculateTotalDiscount,
  calculateTotalAmount,
  calculateExpenses,
  onSubmit,
  loading,
  onShowCreateCustomer,
  onShowUpdateCustomer,
  onPrintInvoice,
  onPrintQuotation,
}) => {
  const dispatch = useDispatch()
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    represent: '',
  })
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [isPrintContract, setIsPrintContract] = useState(false)
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(null)
  const [openOrderDatePicker, setOpenOrderDatePicker] = useState(false)
  const [openDeliveryDatePicker, setOpenDeliveryDatePicker] = useState(false)

  const handleCreateCustomerInline = async () => {
    if (!newCustomerData.name.trim()) {
      toast.error('Vui lòng nhập tên khách hàng')
      return
    }
    if (!newCustomerData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    if (!newCustomerData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ')
      return
    }

    try {
      setIsCreatingCustomer(true)
      const newCustomer = await dispatch(
        createCustomer({
          code: '',
          name: newCustomerData.name,
          phone: newCustomerData.phone,
          email: newCustomerData.email,
          address: newCustomerData.address,
          represent: newCustomerData.represent || '',
          note: '',
          type: 'company',
          taxCode: '',
        })
      ).unwrap()

      if (newCustomer) {
        toast.success('Tạo khách hàng thành công')
        setNewCustomerData({
          name: '',
          phone: '',
          email: '',
          address: '',
          represent: '',
        })
        onSelectCustomer(newCustomer)
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Lỗi tạo khách hàng')
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const subtotal = calculateSubTotal()
  const tax = calculateTotalTax()
  const discount = calculateTotalDiscount()
  const expenses = calculateExpenses()
  const total = calculateTotalAmount()

  return (
    <div className="w-80 bg-gradient-to-b border-l from-muted/50 to-background flex flex-col relative">
      {/* Left divider */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

      {/* Header */}
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
        <h3 className="font-semibold">Thông tin đơn hàng</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Khách hàng</label>

            {selectedCustomer ? (
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedCustomer?.name}`}
                      alt={selectedCustomer?.name}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {selectedCustomer?.name}
                    </div>
                    {selectedCustomer?.code && (
                      <div className="text-xs text-muted-foreground">
                        {selectedCustomer?.code}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onSelectCustomer(null)}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-1.5 text-xs">
                  {selectedCustomer?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MobileIcon className="h-3 w-3" />
                      <a
                        href={`tel:${selectedCustomer?.phone}`}
                        className="hover:text-primary"
                      >
                        {selectedCustomer?.phone}
                      </a>
                    </div>
                  )}
                  {selectedCustomer?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <a
                        href={`mailto:${selectedCustomer?.email}`}
                        className="hover:text-primary truncate"
                      >
                        {selectedCustomer?.email}
                      </a>
                    </div>
                  )}
                  {selectedCustomer?.address && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{selectedCustomer?.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal"
                            >
                              {field.value
                                ? customers.find((c) => c.id === field.value)?.name
                                : 'Chọn khách hàng'}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Tìm kiếm..." className="h-9" />
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {customers.map((customer) => (
                                  <CommandItem
                                    value={customer.id}
                                    key={customer.id}
                                    onSelect={() => onSelectCustomer(customer)}
                                  >
                                    {customer.name} - {customer.phone}
                                    <CheckIcon
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        customer.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
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

                {/* Inline Create Customer Form - visible only when no customer selected */}
                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  <div className="text-xs font-medium text-muted-foreground">Hoặc tạo mới</div>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Tên khách hàng</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên"
                        value={newCustomerData.name}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập SĐT"
                        value={newCustomerData.phone}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập email"
                        value={newCustomerData.email}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Địa chỉ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập địa chỉ"
                        value={newCustomerData.address}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </FormControl>
                  </FormItem>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={handleCreateCustomerInline}
                    disabled={isCreatingCustomer}
                    loading={isCreatingCustomer}
                  >
                    {isCreatingCustomer ? 'Đang tạo...' : 'Tạo khách hàng mới'}
                  </Button>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Order Date */}
          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày đặt hàng</FormLabel>
                <Popover open={openOrderDatePicker} onOpenChange={setOpenOrderDatePicker}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {field.value
                          ? new Date(field.value).toLocaleDateString('vi-VN')
                          : 'Chọn ngày'}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DatePicker
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? date.toISOString() : null)
                        setOpenOrderDatePicker(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phương thức thanh toán</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
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

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Tổng kết</h4>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span>{moneyFormat(subtotal)}</span>
              </div>

              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thuế:</span>
                  <span>{moneyFormat(tax)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Giảm giá:</span>
                  <span>-{moneyFormat(discount)}</span>
                </div>
              )}

              {expenses > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí khác:</span>
                  <span>{moneyFormat(expenses)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-semibold text-base pt-1">
                <span>Tổng cộng:</span>
                <span className="text-primary">{moneyFormat(total)}</span>
              </div>

              <div className="text-xs text-muted-foreground pt-1">
                Bằng chữ: <span className="font-medium">{toVietnamese(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Checkbox
            id="print-contract"
            checked={isPrintContract}
            onCheckedChange={setIsPrintContract}
          />
          <label
            htmlFor="print-contract"
            className="text-sm font-medium cursor-pointer"
          >
            In hợp đồng
          </label>
        </div>

        {isPrintContract && (
          <div className="mb-2">
            <label className="text-sm font-medium">Ngày dự kiến giao hàng</label>
            <Popover open={openDeliveryDatePicker} onOpenChange={setOpenDeliveryDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1',
                    !expectedDeliveryDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {expectedDeliveryDate
                    ? new Date(expectedDeliveryDate).toLocaleDateString('vi-VN')
                    : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DatePicker
                  mode="single"
                  selected={expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined}
                  onSelect={(date) => {
                    setExpectedDeliveryDate(date ? date.toISOString() : null)
                    setOpenDeliveryDatePicker(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Main Create Button */}
        <Button
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
          loading={loading}
        >
          <IconDatabasePlus className="h-4 w-4 mr-2" />
          Tạo hóa đơn
        </Button>

        {/* Create and Print Buttons */}
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              onPrintInvoice()
              form.handleSubmit(onSubmit)()
            }}
            disabled={loading}
          >
            <IconFileTypePdf className="h-4 w-4 mr-2" />
            Tạo Và In Hóa Đơn
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              onPrintQuotation()
              form.handleSubmit(onSubmit)()
            }}
            disabled={loading}
          >
            <IconFileTypePdf className="h-4 w-4 mr-2" />
            Tạo Và In Thỏa Thuận
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceSidebar
