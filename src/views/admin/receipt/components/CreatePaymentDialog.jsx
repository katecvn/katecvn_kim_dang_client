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
import { useEffect } from 'react'
import { Input } from '@/components/ui/input'

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

  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  const form = useForm({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      paymentMethod: 'transfer',
      paymentAmount: parseInt(receipt.debt.remainingAmount),
      paymentNote: '',
      status: 'pending',
      bankAccount: null,
      dueDate: null,
    },
  })

  const location = useLocation()
  const onSubmit = async (data) => {
    const dataToSend = {
      ...data,
      receiptId: receipt.id,
    }

    try {
      const getAdminReceipts = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('GET_RECEIPT')

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
