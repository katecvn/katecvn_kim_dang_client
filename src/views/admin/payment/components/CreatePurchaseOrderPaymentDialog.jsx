import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, MapPin } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { paymentMethods } from '../../receipt/data' // Assuming centralized or relative import works, check path
import { createPaymentSchema } from '../../receipt/schema'
import { useDispatch, useSelector } from 'react-redux'
import { createPayment } from '@/stores/PaymentSlice'
import { Input } from '@/components/ui/input'
import { getSetting } from '@/stores/SettingSlice'
import { cn } from '@/lib/utils'
import { getPurchaseOrders } from '@/stores/PurchaseOrderSlice'
import { getEndOfCurrentMonth, getStartOfCurrentMonth } from '@/utils/date-format'

const CreatePurchaseOrderPaymentDialog = ({
  purchaseOrder,
  open,
  onOpenChange,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  onSuccess,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.payment.loading)
  const setting = useSelector((state) => state.setting.setting)
  const banks = setting?.payload?.banks || []

  const supplier = purchaseOrder?.supplier
  const items = purchaseOrder?.items || []

  const totalAmount = parseFloat(purchaseOrder.totalAmount || 0)
  //   const totalTaxAmount = parseFloat(purchaseOrder.taxAmount || 0)
  //   const totalDiscount = parseFloat(purchaseOrder.discount || 0)
  const paidAmount = parseFloat(purchaseOrder.paidAmount || 0)
  const remainingAmount = totalAmount - paidAmount

  // We reuse createPaymentSchema which likely validates paymentAmount, paymentMethod etc.
  const form = useForm({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      note: '',
      paymentAmount: remainingAmount > 0 ? remainingAmount : 0,
      paymentMethod: 'transfer', // Default
      paymentNote: '',
      bankAccount: null,
      status: 'success',
      dueDate: null, // Not always needed for outgoing payment if immediate
    },
  })

  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  useEffect(() => {
    if (open && purchaseOrder) {
      form.reset({
        note: '',
        paymentAmount: remainingAmount > 0 ? remainingAmount : 0,
        paymentMethod: 'transfer',
        paymentNote: '',
        bankAccount: null,
        status: 'success',
      })
    }
  }, [open, purchaseOrder, remainingAmount, form])


  const onSubmit = async (data) => {
    const dataToSend = {
      ...data,
      purchaseOrderId: purchaseOrder.id,
      voucherType: 'payment_out',
      transactionType: 'payment',
      receiverType: 'supplier',
      receiverId: supplier?.id,
      amount: parseInt(data.paymentAmount) || 0,

      // Map schema fields to API payload
      paymentMethod: data.paymentMethod,
      bankAccount: data.paymentMethod === 'transfer' && data.bankAccount
        ? {
          bankName: data.bankAccount.bankName,
          accountNumber: data.bankAccount.accountNumber,
          accountName: data.bankAccount.accountName,
          bankBranch: data.bankAccount.bankBranch
        }
        : null,
      voucherDate: new Date().toISOString(),
      paymentDate: new Date().toISOString(),
      reason: data.note || `Chi trả đơn hàng ${purchaseOrder.code}`,
      note: data.paymentNote,
      //autoComplete: true,
    }

    try {
      await dispatch(createPayment(dataToSend)).unwrap()
      dispatch(
        getPurchaseOrders({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      )

      if (onSuccess) {
        onSuccess()
      }
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  const paymentMethod = form.watch('paymentMethod')

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className={cn("md:h-auto md:max-w-full", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Tạo phiếu chi mới</DialogTitle>
          <DialogDescription>
            Kiểm tra và hoàn thành thông tin bên dưới để tạo phiếu chi
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-payment" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 space-y-6 rounded-lg border p-4">
                  <h2 className="text-lg font-semibold">
                    Thông tin đơn đặt hàng: {purchaseOrder?.code}
                  </h2>

                  <div className="space-y-6">
                    <div className="overflow-x-auto rounded-lg border">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-secondary text-xs">
                            <TableHead className="w-8">TT</TableHead>
                            <TableHead className="min-w-40">Sản phẩm</TableHead>
                            <TableHead className="min-w-20">SL</TableHead>
                            <TableHead className="min-w-16">ĐVT</TableHead>
                            <TableHead className="min-w-20">đơn giá</TableHead>
                            {/* <TableHead className="min-w-16">Thuế</TableHead>
                              <TableHead className="min-w-28 md:w-16">Giảm giá</TableHead> */}
                            <TableHead className="min-w-28">Thành tiền</TableHead>
                            <TableHead className="min-w-28">Ghi chú</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.productName}</div>
                                  <div className="text-xs text-muted-foreground">{item.productCode}</div>
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unitName || '—'}</TableCell>
                              <TableCell className="text-end">{moneyFormat(item.unitPrice)}</TableCell>
                              {/* <TableCell className="text-end">{moneyFormat(item.taxAmount)}</TableCell>
                                <TableCell className="text-end">{moneyFormat(item.discount)}</TableCell> */}
                              <TableCell className="text-end">{moneyFormat(item.total || (item.quantity * item.unitPrice))}</TableCell>
                              <TableCell>{item.note || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem className="mb-2 space-y-1">
                            <FormLabel>Lý do chi</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Nhập lý do chi"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <strong>Tổng giá trị đơn hàng:</strong>
                          <span>{moneyFormat(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <strong>Đã thanh toán:</strong>
                          <span>{moneyFormat(paidAmount)}</span>
                        </div>
                        <div className="flex justify-between text-destructive">
                          <strong>Còn nợ:</strong>
                          <span>{moneyFormat(remainingAmount)}</span>
                        </div>

                        <Separator />

                        <div className="mb-3">
                          <FormField
                            control={form.control}
                            name="paymentAmount"
                            render={({ field }) => (
                              <FormItem className="mb-2 space-y-1">
                                <FormLabel required={true}>Số tiền chi</FormLabel>
                                <FormControl>
                                  <Input
                                    value={moneyFormat(field.value)}
                                    placeholder="0"
                                    className="w-full text-end font-bold"
                                    onChange={(e) => {
                                      const rawValue = e.target.value.replace(/\D/g, '')
                                      form.setValue('paymentAmount', rawValue)
                                    }}
                                  />
                                </FormControl>
                                <div className="text-xs text-muted-foreground">
                                  Bằng chữ: <span className="font-medium">{toVietnamese(field.value)}</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="mb-3 mt-3">
                            <FormField
                              control={form.control}
                              name="paymentMethod"
                              render={({ field }) => (
                                <FormItem className="mb-3 space-y-1">
                                  <FormLabel required={true}>Phương thức</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn phương thức" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="z-[100020]">
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

                            {paymentMethod === 'transfer' && (
                              <FormField
                                control={form.control}
                                name="bankAccount"
                                render={({ field }) => (
                                  <FormItem className="mb-3 space-y-1">
                                    <FormLabel required={true}>Tài khoản nguồn</FormLabel>
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
                                          <SelectValue placeholder="Chọn tài khoản" />
                                        </SelectTrigger>
                                      </FormControl>

                                      <SelectContent className="z-[100020]">
                                        <SelectGroup>
                                          {banks.map((bank, index) => (
                                            <SelectItem
                                              key={index}
                                              value={bank.accountNumber}
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-medium">
                                                  {bank.bankName} – {bank.accountNumber}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                  {bank.accountName}
                                                </span>
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
                            )}
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
                                      rows={2}
                                      placeholder="Ghi chú thêm về thanh toán..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-lg border p-4 lg:w-72">
                  <div className="flex items-center justify-between">
                    <h2 className="py-2 text-lg font-semibold">Nhà cung cấp</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${supplier?.name}`}
                          alt={supplier?.name}
                        />
                        <AvatarFallback>NCC</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{supplier?.name}</div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-medium">Thông tin liên hệ</div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <MobileIcon className="h-4 w-4" />
                          </div>
                          <a href={`tel:${supplier?.phone}`}>
                            {supplier?.phone || 'Chưa cập nhật'}
                          </a>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <Mail className="h-4 w-4" />
                          </div>
                          <a href={`mailto:${supplier?.email}`}>
                            {supplier?.email || 'Chưa cập nhật'}
                          </a>
                        </div>

                        <div className="flex items-center text-primary hover:text-secondary-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <MapPin className="h-4 w-4" />
                          </div>
                          {supplier?.address || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
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

          <Button form="create-payment" loading={loading}>
            Tạo phiếu chi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePurchaseOrderPaymentDialog
