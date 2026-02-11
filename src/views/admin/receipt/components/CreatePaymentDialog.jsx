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
import { PlusIcon } from '@radix-ui/react-icons'

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
import { useDispatch, useSelector } from 'react-redux'
import { createPayment } from '@/stores/PaymentSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SelectGroup } from '@radix-ui/react-select'
import { paymentMethods } from '../data'
import { Textarea } from '@/components/ui/textarea'
import { moneyFormat } from '@/utils/money-format'
import MoneyInput from '@/components/custom/MoneyInput'
import { createPaymentSchema } from '../schema'
import { useLocation } from 'react-router-dom'
import { getMyReceipts, getReceipts } from '@/stores/ReceiptSlice'
import { getSetting } from '@/stores/SettingSlice'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { generateVietQR, downloadQRCode, copyPaymentInfo } from '@/utils/generate-vietqr'
import { toast } from 'sonner'
import { Download, Copy } from 'lucide-react'

const CreatePaymentDialog = ({
  receipt,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.payment.loading)
  const dispatch = useDispatch()
  const setting = useSelector((state) => state.setting.setting)
  const banks = setting?.payload?.banks || []
  const [qrCodeUrl, setQrCodeUrl] = useState(null)

  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  const form = useForm({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      paymentMethod: 'cash',
      paymentAmount: parseInt(receipt.debt.remainingAmount),
      paymentNote: '',
      status: 'pending',
      bankAccount: null,
      dueDate: null,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        paymentMethod: 'cash',
        paymentAmount: parseInt(receipt.debt.remainingAmount),
        paymentNote: '',
        status: 'pending',
        bankAccount: null,
        dueDate: null,
      })
    }
  }, [open, receipt, form])

  const location = useLocation()
  const onSubmit = async (data) => {
    const dataToSend = {
      ...data,
      receiptId: receipt.id,
    }

    try {
      const getAdminReceipts = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('RECEIPT_VIEW_ALL')

      await dispatch(createPayment(dataToSend)).unwrap()
      if (location.pathname === '/receipts' && getAdminReceipts) {
        await dispatch(getReceipts()).unwrap()
      } else {
        await dispatch(getMyReceipts()).unwrap()
      }
      form.reset()
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  const paymentMethod = form.watch('paymentMethod')
  const selectedBankAccount = form.watch('bankAccount')
  const paymentAmount = form.watch('paymentAmount')

  // Generate QR code when bank account and amount are available
  useEffect(() => {
    const generateQR = async () => {
      if (paymentMethod === 'transfer' && selectedBankAccount && paymentAmount) {
        const content = `Thanh toan ${receipt.code}`
        const qrUrl = await generateVietQR(selectedBankAccount, paymentAmount, content)
        setQrCodeUrl(qrUrl)
      } else {
        setQrCodeUrl(null)
      }
    }
    generateQR()
  }, [paymentMethod, selectedBankAccount, paymentAmount, receipt.code])

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      downloadQRCode(qrCodeUrl, `vietqr-${receipt.code}.png`)
      toast.success('Đã tải QR code')
    }
  }

  const handleCopyPaymentInfo = async () => {
    if (selectedBankAccount && paymentAmount) {
      const content = `Thanh toan ${receipt.code}`
      const success = await copyPaymentInfo(selectedBankAccount, paymentAmount, content)
      if (success) {
        toast.success('Đã copy thông tin thanh toán')
      } else {
        toast.error('Không thể copy thông tin')
      }
    }
  }

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

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Thêm khoản thanh toán mới cho phiếu thu: {receipt.code}
          </DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để thêm khoản thanh toán mới cho phiếu
            thu: {receipt.code}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-unit" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="mb-3 space-y-1">
                      <FormLabel required={true}>
                        Phương thức thanh toán
                      </FormLabel>
                      <Select
                        value={field.value}
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
                        <FormLabel required>Tài khoản nhận tiền</FormLabel>

                        <Select
                          value={field.value?.accountNumber}
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
                                      {bank.bankName} – {bank.accountNumber}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {bank.accountName} · {bank.bankBranch}
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

                <MoneyInput
                  form={form}
                  label="Số tiền cần thu"
                  name="paymentAmount"
                  required={true}
                  placeholder="Nhập số tiền cần thu"
                  description={`Số tiền cần thanh toán không được vượt quá ${moneyFormat(receipt.debt.remainingAmount)}`}
                />

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

              {/* VietQR Display */}
              {paymentMethod === 'transfer' && qrCodeUrl && (
                <div className="col-span-2 rounded-lg border p-4">
                  <div className="text-center">
                    <h3 className="mb-3 font-semibold">Quét mã QR để thanh toán</h3>

                    {/* QR Code Image */}
                    <div className="mb-3 flex justify-center">
                      <img
                        src={qrCodeUrl}
                        alt="VietQR Payment"
                        className="h-64 w-64 rounded border"
                      />
                    </div>

                    {/* Bank Details */}
                    {selectedBankAccount && (
                      <div className="mb-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngân hàng:</span>
                          <span className="font-medium">{selectedBankAccount.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Số TK:</span>
                          <span className="font-medium">{selectedBankAccount.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Chủ TK:</span>
                          <span className="font-medium">{selectedBankAccount.accountName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Số tiền:</span>
                          <span className="font-bold text-primary">
                            {moneyFormat(paymentAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nội dung:</span>
                          <span className="font-medium">Thanh toan {receipt.code}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadQR}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Tải QR
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPaymentInfo}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy thông tin
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-1">
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

          <Button form="create-unit" loading={loading}>
            Thêm mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePaymentDialog