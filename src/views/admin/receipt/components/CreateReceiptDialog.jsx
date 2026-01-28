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
import { useCallback, useEffect, useState } from 'react'
import { reviewReceipt } from '@/api/receipt'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { paymentMethods } from '../data'
import { createReceiptSchema } from '../schema'
import { useDispatch, useSelector } from 'react-redux'
import { createReceipt, getReceiptQRCode } from '@/stores/ReceiptSlice'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { getSetting } from '@/stores/SettingSlice'

const CreateReceiptDialog = ({
  invoices,
  open,
  onOpenChange,
  showTrigger = true,
  table,
  ...props
}) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [invoiceData, setInvoiceData] = useState([])
  const [qrCodeData, setQrCodeData] = useState(null)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [createdReceiptId, setCreatedReceiptId] = useState(null)
  const setting = useSelector((state) => state.setting.setting)
  const invoiceItems = invoiceData?.flatMap((invoice) => invoice.invoiceItems)
  const customer = invoiceData?.[0]?.customer
  const banks = setting?.payload?.banks || []

  const totalAmount = invoiceItems
    ?.map((product) => product)
    .reduce((acc, product) => acc + product.total, 0)
  const totalTaxAmount = invoiceItems
    ?.map((product) => product.taxAmount)
    .reduce((acc, taxAmount) => acc + taxAmount, 0)
  const totalDiscount = invoiceItems
    ?.map((product) => product.discount)
    .reduce((acc, discount) => acc + discount, 0)

  const remainingAmount = invoiceData?.reduce((acc, invoice) => {
    return acc + (parseFloat(invoice.totalAmount || 0) - parseFloat(invoice.paidAmount || 0))
  }, 0)

  const form = useForm({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: async () => ({
      note: '',
      totalAmount,
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
      bankAccount: null,
      dueDate: null,
      isDeposit: false,
    }),
  })

  const fetchData = useCallback(async () => {
    const validInvoices = invoices?.filter((id) => id)
    if (!validInvoices || validInvoices.length === 0) return

    setLoading(true)
    try {
      const data = await reviewReceipt(validInvoices)
      setInvoiceData(data || [])
    } catch (error) {
      setLoading(false)
      console.log('Failed to fetch data: ', error)
    } finally {
      setLoading(false)
    }
  }, [invoices])

  useEffect(() => {
    fetchData()
    table?.resetRowSelection?.()
  }, [invoices, fetchData, table])

  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  useEffect(() => {
    if (invoiceData.length > 0) {
      // Default to remaining amount for payment input
      form.setValue('totalAmount', remainingAmount > 0 ? remainingAmount : 0)
      form.setValue('totalTaxAmount', totalTaxAmount)
      form.setValue('totalDiscount', totalDiscount)
    }
  }, [invoiceData, form, remainingAmount, totalTaxAmount, totalDiscount])
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    // Build payload matching backend requirements
    const dataToSend = {
      // Voucher & Transaction Type
      voucherType: 'receipt_in',  // receipt_in (Thu) | payment_out (Chi)
      transactionType: data.isDeposit ? 'deposit' : 'payment',  // payment | deposit | refund
      receiverType: 'customer',   // customer | supplier
      receiverId: customer?.id,   // ID Khách hàng

      // Invoice & Amount - invoiceId gửi giá trị đơn (không phải mảng)
      invoiceId: Array.isArray(invoices) ? invoices[0] : invoices,
      amount: parseInt(data.totalAmount) || 0,  // Số tiền thu

      // Payment Details
      paymentMethod: data.paymentMethod,  // cash | transfer
      bankAccount: data.paymentMethod === 'transfer' && data.bankAccount
        ? {
          bankName: data.bankAccount.bankName,
          accountNumber: data.bankAccount.accountNumber,
          accountName: data.bankAccount.accountName,
          bankBranch: data.bankAccount.bankBranch
        }
        : null,

      // Date & Status
      paymentDate: new Date().toISOString(),  // Current timestamp
      reason: data.note || 'Thu tiền bán hàng',  // Lý do
      status: 'completed',  // completed | draft

      // Additional notes
      paymentNote: data.paymentNote || null,
      dueDate: data.dueDate || null
    }

    try {
      const result = await dispatch(createReceipt(dataToSend)).unwrap()
      const receiptId = result?.id

      // If payment method is transfer, fetch and show QR code
      if (data.paymentMethod === 'transfer' && receiptId) {
        setCreatedReceiptId(receiptId)
        try {
          const qrData = await dispatch(getReceiptQRCode(receiptId)).unwrap()
          setQrCodeData(qrData)
          setShowQrDialog(true)
        } catch (qrError) {
          console.error('Failed to fetch QR code:', qrError)
          navigateAway()
        }
      } else {
        // Cash payment or no receipt ID, navigate immediately
        navigateAway()
      }
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  const navigateAway = () => {
    const getAdminReceipt = JSON.parse(
      localStorage.getItem('permissionCodes'),
    ).includes('GET_RECEIPT')
    getAdminReceipt ? navigate('/receipt') : navigate('/receipt-user')
    form.reset()
    onOpenChange?.(false)
  }

  const handleCloseQrDialog = () => {
    setShowQrDialog(false)
    setQrCodeData(null)
    navigateAway()
  }

  const paymentMethod = form.watch('paymentMethod')

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button className="mx-2" variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Thêm mới
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="md:h-auto md:max-w-full">
          <DialogHeader>
            <DialogTitle>Thêm phiếu thu mới</DialogTitle>
            <DialogDescription>
              Kiểm tra và hoàn thành thông tin bên dưới để thêm phiếu thu mới
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
            <Form {...form}>
              <form id="create-receipt" onSubmit={form.handleSubmit(onSubmit)}>
                {loading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Skeleton className="h-[20px] w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <div className="flex-1 space-y-6 rounded-lg border p-4">
                        <h2 className="text-lg font-semibold">
                          Thông tin chi tiết phiếu thu
                        </h2>

                        <div className="space-y-6">
                          <div className="overflow-x-auto rounded-lg border">
                            <Table className="min-w-full">
                              <TableHeader>
                                <TableRow className="bg-secondary text-xs">
                                  <TableHead className="w-8">TT</TableHead>
                                  <TableHead className="min-w-40">
                                    Sản phẩm
                                  </TableHead>
                                  <TableHead className="min-w-20">SL</TableHead>
                                  <TableHead className="min-w-16">ĐVT</TableHead>
                                  <TableHead className="min-w-20">Giá</TableHead>
                                  <TableHead className="min-w-16">Thuế</TableHead>
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
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {invoiceItems.map((product, index) => (
                                  <TableRow key={product.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">
                                          {product.productName}
                                        </div>
                                        {product?.options && (
                                          <div className="break-words text-sm text-muted-foreground">
                                            {product?.options
                                              ?.map(
                                                (option) =>
                                                  `${option.name}: ${option.pivot.value}`,
                                              )
                                              .join(', ')}
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>
                                      {product.unitName || 'Không có'}
                                    </TableCell>
                                    <TableCell className="text-end">
                                      {moneyFormat(product.price)}
                                    </TableCell>
                                    <TableCell className="text-end">
                                      {moneyFormat(product.taxAmount)}
                                    </TableCell>
                                    <TableCell className="text-end">
                                      {moneyFormat(product.discount)}
                                    </TableCell>
                                    <TableCell className="text-end">
                                      {moneyFormat(product.total)}
                                    </TableCell>
                                    <TableCell>
                                      {product.warranty || 'Không có'}
                                    </TableCell>
                                    <TableCell>
                                      {product.note || 'Không có'}
                                    </TableCell>
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
                                  <FormLabel>Ghi chú phiếu thu</FormLabel>
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

                            <div className="space-y-4 text-sm">
                              <div className="flex justify-between">
                                <strong>Tổng cộng:</strong>
                                <span>{moneyFormat(totalAmount)}</span>
                              </div>
                              <div className="flex justify-start">
                                <div className="text-sm font-bold">
                                  Số tiền viết bằng chữ:{' '}
                                  <span className="font-bold">
                                    {toVietnamese(totalAmount)}
                                  </span>
                                </div>
                              </div>

                              <Separator />

                              <div className="flex justify-between">
                                <strong>Giá trên đã bao gồm</strong>
                              </div>
                              <div className="flex justify-between">
                                <strong>Giảm giá:</strong>
                                <span>{moneyFormat(totalDiscount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <strong>Thuế:</strong>
                                <span>{moneyFormat(totalTaxAmount)}</span>
                              </div>

                              <Separator />

                              <div className="mb-3">
                                <FormField
                                  control={form.control}
                                  name="totalAmount"
                                  render={({ field }) => (
                                    <FormItem className="mb-2 space-y-1">
                                      <FormLabel required={true}>
                                        Số tiền thu
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          value={moneyFormat(field.value)}
                                          placeholder="0"
                                          className="w-full text-end"
                                          onChange={(e) => {
                                            const rawValue =
                                              e.target.value.replace(/\D/g, '')
                                            form.setValue('totalAmount', rawValue)
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Deposit Checkbox */}
                                <FormField
                                  control={form.control}
                                  name="isDeposit"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer font-normal">
                                        Đây là phiếu cọc
                                      </FormLabel>
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
                                              <SelectGroup>
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
                                              </SelectGroup>
                                            </SelectContent>
                                          </Select>

                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}

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
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full rounded-lg border p-4 lg:w-72">
                        <div className="flex items-center justify-between">
                          <h2 className="py-2 text-lg font-semibold">
                            Khách hàng
                          </h2>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?bold=true&background=random&name=${customer?.name}`}
                                alt={customer?.name}
                              />
                              <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer?.name}</div>
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
                                <a href={`tel:${customer?.phone}`}>
                                  {customer?.phone || 'Chưa cập nhật'}
                                </a>
                              </div>

                              <div className="flex items-center text-muted-foreground">
                                <div className="mr-2 h-4 w-4 ">
                                  <Mail className="h-4 w-4" />
                                </div>
                                <a href={`mailto:${customer?.email}`}>
                                  {customer?.email || 'Chưa cập nhật'}
                                </a>
                              </div>

                              <div className="flex items-center text-primary hover:text-secondary-foreground">
                                <div className="mr-2 h-4 w-4 ">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                {customer?.address || 'Chưa cập nhật'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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

            <Button form="create-receipt" loading={loading}>
              Thêm mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mã QR Thanh Toán</DialogTitle>
            <DialogDescription>
              Quét mã QR để thanh toán {qrCodeData?.voucherCode}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-4">
            {qrCodeData?.qrLink ? (
              <>
                <img
                  src={qrCodeData.qrLink}
                  alt="QR Code"
                  className="w-64 h-64 border rounded-lg"
                />
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-primary">
                    {moneyFormat(qrCodeData.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {qrCodeData.description}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                Đang tải mã QR...
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={handleCloseQrDialog} className="w-full sm:w-auto">
              Đóng và tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateReceiptDialog
