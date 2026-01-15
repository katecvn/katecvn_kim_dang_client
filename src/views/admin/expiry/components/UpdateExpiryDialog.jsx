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

import { Input } from '@/components/ui/input'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsers } from '@/stores/UserSlice'
import { CalendarIcon, CaretSortIcon, MobileIcon } from '@radix-ui/react-icons'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getCustomers } from '@/stores/CustomerSlice'
import CreateCustomerDialog from '../../customer/components/CreateCustomerDialog'
import { getAuthUserRolePermissions } from '@/stores/AuthSlice'
import { dateFormat } from '@/utils/date-format'
import { getExpiriesByCustomerId, updateExpiry } from '@/stores/ExpirySlice'
import { Textarea } from '@/components/ui/textarea'
import { getProducts } from '@/stores/ProductSlice'
import { AvatarImage, AvatarFallback, Avatar } from '@/components/ui/avatar'
import { CheckIcon, Mail, MapPin } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { DatePicker } from '@/components/custom/DatePicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateExpirySchema } from '../schema'

const UpdateExpiryDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  customerAccount,
  ...props
}) => {
  const loading = useSelector((state) => state.expiry.loading)
  const dispatch = useDispatch()
  const customers = useSelector((state) => state.customer.customers)
  const products = useSelector((state) => state.product.products)
  const users = useSelector((state) => state.user.users)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerAccounts, setCustomerAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [nearestExpiryDate, setNearestExpiryDate] = useState(null)

  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}

  const form = useForm({
    resolver: zodResolver(updateExpirySchema),
    defaultValues: {
      name: customerAccount?.accountName || '',
      customerId: customerAccount?.customerId || 0,
      productId: customerAccount?.expiries[0]?.productId || 0,
      invoiceId: customerAccount?.expiries[0]?.invoice?.code?.toString() || '',
      options: JSON.parse(customerAccount?.expiries[0]?.options) || [],
      startDate: new Date(customerAccount.expiries[0].startDate) || undefined,
      months: customerAccount?.expiries[0]?.months || 1,
      alertDateStep: customerAccount?.expiries[0]?.alertDateStep || 30,
      note: customerAccount?.expiries[0]?.note || '',
      userId:
        customerAccount?.expiries[0]?.userId ||
        authUserWithRoleHasPermissions.id,
      accountId: customerAccount?.id || 0,
    },
  })

  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)

  useEffect(() => {
    dispatch(getUsers())
    dispatch(getCustomers())
    dispatch(getAuthUserRolePermissions())
    dispatch(getProducts())
  }, [dispatch])

  useEffect(() => {
    if (customerAccount?.customer) {
      setSelectedCustomer(customerAccount?.customer)
      setNearestExpiryDate(customerAccount.expiries?.[1]?.endDate || null)
    }
  }, [customerAccount])

  // Khi chọn khách hàng
  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer)
    form.setValue('customerId', customer.id)
    try {
      const res = await dispatch(
        getExpiriesByCustomerId({ customerId: customer.id }),
      ).unwrap()
      const accounts = res?.data?.accounts || []
      setCustomerAccounts(accounts)
      // Reset các trường liên quan account
      setSelectedAccount(null)
      form.setValue('accountId', 0)
      form.setValue('name', '')
      form.setValue('productId', 0)
      setSelectedProduct(null)
    } catch {
      setCustomerAccounts([])
      setSelectedAccount(null)
      form.setValue('accountId', 0)
      form.setValue('name', '')
      form.setValue('productId', 0)
      setSelectedProduct(null)
    }
  }

  // Khi chọn accountId → fill name, đồng thời nếu account có productId thì tự chọn product
  const handleSelectAccount = (accountIdStr) => {
    const accountId = Number(accountIdStr)
    const acc = customerAccounts.find((a) => a.id === accountId)
    if (acc) {
      form.setValue('accountId', acc.id, { shouldValidate: true })
      form.setValue('name', acc.accountName, { shouldValidate: true })
      form.setValue('productId', acc.expiries?.[0]?.productId || 0, {
        shouldValidate: true,
      })
      setSelectedAccount(acc)
      const foundProduct = products.find(
        (p) => p.id === acc.expiries?.[0]?.productId,
      )
      setSelectedProduct(foundProduct || null)
      setNearestExpiryDate(acc.expiries?.[0]?.endDate || null)
    } else {
      form.setValue('accountId', 0, { shouldValidate: true })
      form.setValue('name', '', { shouldValidate: true })
      form.setValue('productId', 0, { shouldValidate: true })
      setSelectedAccount(null)
      setSelectedProduct(null)
      setNearestExpiryDate(null)
    }
  }

  const onSubmit = async (data) => {
    const { accountId, name } = data
    const payload = {
      ...data,
      accountName: name,
      accountId: accountId > 0 ? accountId : null,
      productId: selectedProduct?.id || data.productId,
      options: selectedProduct?.attributes ? selectedProduct.attributes : [],
      expiryId: customerAccount?.expiries[0]?.id,
    }

    try {
      await dispatch(updateExpiry(payload)).unwrap()
      form.reset()
      setCustomerAccounts([])
      setSelectedCustomer(null)
      setSelectedAccount(null)
      setSelectedProduct(null)
      onOpenChange?.(false)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger && (
          <DialogTrigger>
            <p className="cursor-pointer font-bold text-primary">
              + Cập nhật thông tin quản lý hạn dùng
            </p>
          </DialogTrigger>
        )}

        <DialogContent className="md:h-auto md:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin quản lý hạn dùng</DialogTitle>
            <DialogDescription>
              Điền thông tin bên dưới để cập nhật thông tin quản lý hạn dùng.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
            <Form {...form}>
              <form id="update-expiry" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2 lg:flex-row">
                  <div className="flex-1 space-y-6 rounded-lg border p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Tài khoản khách hàng (select) */}
                      <FormField
                        control={form.control}
                        name="accountId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tài khoản khách hàng</FormLabel>
                            <Select
                              disabled={true}
                              onValueChange={handleSelectAccount}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn tài khoản" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">
                                  Chọn tài khoản
                                </SelectItem>
                                {customerAccounts?.map((acc) => (
                                  <SelectItem
                                    key={acc.id}
                                    value={acc.id.toString()}
                                  >
                                    {acc.accountName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tên tài khoản, có datalist gợi ý từ customerAccounts */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Tên tài khoản</FormLabel>
                            <FormControl>
                              <Input placeholder="Tên tài khoản" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Sản phẩm</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full justify-between font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                    disabled={!selectedCustomer}
                                  >
                                    {field.value
                                      ? products.find(
                                          (product) =>
                                            product.id === field.value,
                                        )?.name
                                      : 'Chọn sản phẩm'}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Tìm sản phẩm..."
                                    className="h-9"
                                  />
                                  <CommandEmpty>Không tìm thấy</CommandEmpty>
                                  <CommandGroup>
                                    <CommandList>
                                      {products
                                        .filter((product) => product.hasExpiry)
                                        .map((product) => (
                                          <CommandItem
                                            key={product.id}
                                            value={product.name.toLowerCase()}
                                            onSelect={() => {
                                              form.setValue(
                                                'productId',
                                                product.id,
                                              )
                                              setSelectedProduct(product)
                                            }}
                                          >
                                            {product.name}
                                            <CheckIcon
                                              className={cn(
                                                'ml-auto h-4 w-4',
                                                product.id === field.value
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

                      <FormField
                        control={form.control}
                        name="invoiceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hóa đơn liên quan</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Mã hóa đơn (tuỳ chọn)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Ngày gia hạn</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                  >
                                    {field.value ? (
                                      dateFormat(field.value)
                                    ) : (
                                      <span>Chọn</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
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
                                  selected={field.value}
                                  onSelect={(date) => field.onChange(date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Input nhập số tháng */}
                      <FormField
                        control={form.control}
                        name="months"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Số tháng sử dụng</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={1000}
                                placeholder="Nhập số tháng"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="alertDateStep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Báo trước (ngày)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Số ngày báo trước khi hết hạn"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Nhân viên</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(Number(value))
                              }
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn nhân viên" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">
                                  Chọn nhân viên
                                </SelectItem>
                                {users?.map((user) => (
                                  <SelectItem
                                    key={user.id}
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

                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ghi chú</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ghi chú"
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {/* Khối chọn khách hàng */}
                  <div className="w-full rounded-lg border p-4 lg:w-72">
                    <div className="flex items-center justify-between">
                      <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>
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

                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                              {nearestExpiryDate && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Ngày hết hạn hiện tại của tài khoản đã
                                  chọn:&nbsp;
                                  <span className="font-semibold text-primary">
                                    {dateFormat(nearestExpiryDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
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
                                                handleSelectCustomer(customer)
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
                onClick={() => {
                  form.reset()
                  setCustomerAccounts([])
                  setSelectedCustomer(null)
                  setSelectedAccount(null)
                  setSelectedProduct(null)
                }}
                type="button"
                variant="outline"
              >
                Hủy
              </Button>
            </DialogClose>

            <Button form="update-expiry" loading={loading}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCreateCustomerDialog && (
        <CreateCustomerDialog
          open={showCreateCustomerDialog}
          onOpenChange={setShowCreateCustomerDialog}
          showTrigger={false}
        />
      )}
    </div>
  )
}

export default UpdateExpiryDialog
