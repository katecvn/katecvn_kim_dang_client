import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/custom/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@radix-ui/react-separator'
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import { Mail, MapPin, Pencil } from 'lucide-react'
import { IconCreditCardPay, IconTrash } from '@tabler/icons-react'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { debts, paymentMethods, paymentStatus } from '../data'
import { deletePayment, updatePaymentStatus } from '@/stores/PaymentSlice'
import { getMyReceipts, getReceipts } from '@/stores/ReceiptSlice'
import CreatePaymentDialog from './CreatePaymentDialog'
import { buildPaymentReceiptData } from '../helpers/BuildPaymentReceiptData'
import { exportReceiptPdf } from '../helpers/ExportReceiptPdf'
import UpdatePaymentDueDateDialog from './UpdatePaymentDueDateDialog'
import Can from '@/utils/can'

const getDueDateInfo = (dueDate) => {
  if (!dueDate) return null
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays < 0) {
    return {
      label: `Quá hạn ${Math.abs(diffDays)} ngày`,
      color: 'text-destructive',
    }
  }
  if (diffDays === 0) {
    return {
      label: 'Hạn chót hôm nay',
      color: 'text-orange-500',
    }
  }
  if (diffDays <= 3) {
    return {
      label: `Còn ${diffDays} ngày`,
      color: 'text-orange-500',
    }
  }
  return {
    label: `Còn ${diffDays} ngày`,
    color: 'text-green-600',
  }
}

const ViewReceiptDialog = ({
  receipt,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const [editingDuePayment, setEditingDuePayment] = useState(null)
  const invoiceItems = Array.isArray(receipt?.invoices)
    ? receipt.invoices.flatMap((invoice) => invoice?.invoiceItems || [])
    : []

  const dispatch = useDispatch()
  const location = useLocation()

  const refreshList = async () => {
    const getAdminReceipts = JSON.parse(
      localStorage.getItem('permissionCodes') || '[]',
    ).includes('GET_RECEIPT')
    if (location.pathname === '/receipts' && getAdminReceipts) {
      await dispatch(getReceipts()).unwrap()
    } else {
      await dispatch(getMyReceipts()).unwrap()
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updatePaymentStatus({ id, status })).unwrap()
      await refreshList()
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  const handleDeletePayment = async (id) => {
    try {
      await dispatch(deletePayment(id)).unwrap()
      await refreshList()
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  const [showCreatePaymentDialog, setShowCreatePaymentDialog] = useState(false)

  const handleExportPayment = async (payment) => {
    try {
      const data = buildPaymentReceiptData(receipt, payment)
      const fileName = `receipt-${receipt?.code || 'RC'}-${payment?.code || 'PAY'}.pdf`
      await exportReceiptPdf(data, fileName, 2)
    } catch (e) {
      console.error(e)
      toast.error('Xuất PDF thất bại. Vui lòng thử lại!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="md:h-auto md:max-w-7xl">
        <DialogHeader>
          <DialogTitle>
            Thông tin chi tiết phiếu thu: {receipt?.code}
          </DialogTitle>
          <DialogDescription>
            Dưới đây là thông tin chi tiết phiếu thu: {receipt?.code}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-auto">
          <div className="flex flex-col gap-2 lg:flex-row">
            {/* ===== Left: Phiếu + bảng hàng hoá ===== */}
            <div className="flex-1 space-y-6 rounded-lg border p-4">
              <h2 className="text-lg font-semibold">
                Thông tin phiếu thu bao gồm hóa đơn:{' '}
                {receipt?.invoices && receipt?.invoices.length > 0
                  ? receipt.invoices.map((item, index) => (
                      <span key={item.code}>
                        {item.code}
                        {index < receipt.invoices.length - 1 && ', '}
                      </span>
                    ))
                  : 'Không có hóa đơn'}
              </h2>

              <div className="space-y-6">
                {/* Bảng sản phẩm */}
                <div className="overflow-x-auto rounded-lg border">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-secondary text-xs">
                        <TableHead className="w-8">TT</TableHead>
                        <TableHead className="min-w-40">Sản phẩm</TableHead>
                        <TableHead className="min-w-20">SL</TableHead>
                        <TableHead className="min-w-16">ĐVT</TableHead>
                        <TableHead className="min-w-20">Giá</TableHead>
                        <TableHead className="min-w-16">Thuế</TableHead>
                        <TableHead className="min-w-28 md:w-16">
                          Giảm giá
                        </TableHead>
                        <TableHead className="min-w-28">Tổng cộng</TableHead>
                        <TableHead className="min-w-28 md:w-20">BH</TableHead>
                        <TableHead className="min-w-28">Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.map((product, index) => (
                        <TableRow key={product.id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {product.productName}
                              </div>
                              {product?.options && (
                                <div className="break-words text-sm text-muted-foreground">
                                  {product.options
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
                          <TableCell>{product.note || 'Không có'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Tổng hợp & công nợ */}
                <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                  <div className="text-sm">
                    <strong className="text-destructive">Ghi chú: </strong>
                    <span className="text-primary">
                      {receipt?.note || 'Không có'}
                    </span>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <strong>Tổng tiền:</strong>
                      <div>{moneyFormat(receipt?.totalAmount)}</div>
                    </div>
                    <div className="flex justify-start">
                      <div className="text-sm">
                        Số tiền viết bằng chữ:{' '}
                        <span className="font-medium italic">
                          {toVietnamese(receipt?.totalAmount || 0)}
                        </span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between">
                      <strong>Công nợ:</strong>
                      {(() => {
                        const debtStatus = debts.find(
                          (debt) => debt.value === receipt?.debt?.status,
                        )
                        return debtStatus ? (
                          <span className={debtStatus.color}>
                            {debtStatus.label}
                          </span>
                        ) : (
                          <span className="text-gray-500">Không xác định</span>
                        )
                      })()}
                    </div>
                    <div className="flex justify-between">
                      <strong>Đã thanh toán:</strong>
                      <div>{moneyFormat(receipt?.debt?.paidAmount)}</div>
                    </div>
                    <div className="flex justify-between">
                      <strong>Còn lại:</strong>
                      <div>{moneyFormat(receipt?.debt?.remainingAmount)}</div>
                    </div>
                  </div>
                </div>

                {/* Lịch sử thanh toán */}
                <Separator className="my-4" />
                <h2 className="text-lg font-semibold">Lịch sử thanh toán</h2>

                <Can permission="CREATE_PAYMENT">
                  {Number(receipt?.debt?.remainingAmount || 0) !== 0 && (
                    <Button
                      onClick={() => {
                        Number(receipt?.debt?.remainingAmount || 0) === 0
                          ? toast.warning('Phiếu thu đã được thanh toán hết')
                          : setShowCreatePaymentDialog(true)
                      }}
                    >
                      <IconCreditCardPay className="mr-2 h-4 w-4" /> Thêm khoản
                      thanh toán
                    </Button>
                  )}
                </Can>

                {showCreatePaymentDialog && (
                  <CreatePaymentDialog
                    open={showCreatePaymentDialog}
                    onOpenChange={setShowCreatePaymentDialog}
                    receipt={receipt}
                    showTrigger={false}
                  />
                )}

                <ol
                  className="relative border-s border-primary dark:border-primary"
                  aria-label="Lịch sử thanh toán"
                >
                  {receipt?.payments?.length ? (
                    receipt.payments.map((payment) => (
                      <li className="mb-3 ms-4" key={payment.id}>
                        <div
                          className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-primary bg-primary dark:border-primary dark:bg-primary"
                          aria-hidden="true"
                        />
                        <time
                          className="mb-1 text-sm font-normal leading-none"
                          dateTime={payment.createdAt}
                        >
                          {`${dateFormat(payment.createdAt, true)} - Mã thanh toán: ${payment.code}`}
                        </time>

                        <div className="text-sm">
                          <div className="mr-2 flex items-center">
                            <strong>Số tiền thanh toán:</strong>
                            <p className="mx-2 font-semibold text-primary">
                              {moneyFormat(payment.paymentAmount)}
                            </p>
                          </div>

                          <div className="mr-2 flex items-center">
                            <strong>Phương thức thanh toán:</strong>
                            <p className="mx-2 font-semibold text-primary">
                              {paymentMethods.find(
                                (method) =>
                                  method.value === payment.paymentMethod,
                              )?.label || 'Không xác định'}
                            </p>
                          </div>

                          <div>
                            {payment.paymentMethod === 'transfer' &&
                              payment.accountNumber && (
                                <div className="mr-2 mt-1 rounded-md border border-dashed p-2 text-sm">
                                  <div>
                                    <strong>Ngân hàng:</strong>{' '}
                                    <span className="font-medium">
                                      {payment.bankName}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>Số tài khoản:</strong>{' '}
                                    <span className="font-medium">
                                      {payment.accountNumber}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>Chủ tài khoản:</strong>{' '}
                                    <span className="font-medium">
                                      {payment.accountName}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>Chi nhánh:</strong>{' '}
                                    <span className="font-medium">
                                      {payment.bankBranch}
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="mr-2 flex items-center">
                            <strong>Ghi chú:</strong>
                            <span className="mx-2">
                              {payment.note || 'Không có'}
                            </span>
                          </div>

                          <div className="mb-2 mr-2 flex items-center">
                            <strong>Trạng thái thanh toán:</strong>
                            <span>
                              {payment.status === 'success' ? (
                                <span className="mx-2 font-semibold text-green-500">
                                  Đã thanh toán
                                </span>
                              ) : (
                                <div className="flex items-center space-x-4">
                                  {paymentStatus.map((status) => (
                                    <label
                                      key={status.value}
                                      className="mx-2 flex items-center space-x-2"
                                    >
                                      <input
                                        type="radio"
                                        name={`payment-status-${payment.id}`}
                                        value={status.value}
                                        checked={
                                          payment.status === status.value
                                        }
                                        onChange={() => {
                                          const confirm = window.confirm(
                                            'Bạn có chắc chắn muốn duyệt khoản thu này?',
                                          )
                                          if (confirm) {
                                            handleStatusChange(
                                              payment.id,
                                              status.value,
                                            )
                                          }
                                        }}
                                        className="h-4 w-4"
                                      />
                                      <span>{status.label}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </span>
                          </div>

                          <div>
                            {payment.dueDate && (
                              <div className="mr-2 flex items-center gap-2">
                                <strong>Hạn chót:</strong>

                                {(() => {
                                  const dueInfo = getDueDateInfo(
                                    payment.dueDate,
                                  )
                                  return (
                                    <span
                                      className={`mx-2 font-semibold ${dueInfo.color}`}
                                    >
                                      {dateFormat(payment.dueDate)} (
                                      {dueInfo.label})
                                    </span>
                                  )
                                })()}

                                <Can permission="UPDATE_PAYMENT_DUE_DATE">
                                  <Button
                                    variant="ghost"
                                    className="inline-flex w-8 items-center rounded-md p-0"
                                    title={
                                      payment.status === 'success'
                                        ? 'Khoản này đã thanh toán, không thể sửa hạn'
                                        : 'Sửa hạn chót'
                                    }
                                    disabled={payment.status === 'success'}
                                    onClick={() => {
                                      if (payment.status === 'success') return
                                      setEditingDuePayment(payment)
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Can>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <Can permission={'DELETE_PAYMENT'}>
                              <div
                                className="flex w-40 cursor-pointer items-center text-destructive"
                                onClick={() => {
                                  const confirm = window.confirm(
                                    'Bạn có chắc chắn muốn xóa khoản thanh toán này không?',
                                  )
                                  if (confirm) {
                                    handleDeletePayment(payment.id)
                                  }
                                }}
                              >
                                <IconTrash className="mr-2 h-4 w-4" /> Xóa khoản
                                thu
                              </div>
                            </Can>

                            {/* ====== Xuất PDF cho khoản này ====== */}
                            <Button
                              variant="outline"
                              onClick={() => handleExportPayment(payment)}
                            >
                              Xuất PDF cho khoản này
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Không có lịch sử thanh toán
                    </p>
                  )}
                </ol>
              </div>
            </div>

            {/* ===== Right: Khách hàng & Nhân viên ===== */}
            <div className="w-full rounded-lg border p-4 lg:w-80">
              <div className="flex items-center justify-between">
                <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receipt?.customer?.name}`}
                      alt={receipt?.customer?.name}
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{receipt?.customer?.name}</div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">Thông tin khách hàng</div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <MobileIcon className="h-4 w-4" />
                      </div>
                      <a href={`tel:${receipt?.customer?.phone}`}>
                        {receipt?.customer?.phone || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${receipt?.customer?.email}`}>
                        {receipt?.customer?.email || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <MapPin className="h-4 w-4" />
                      </div>
                      {receipt?.customer?.address || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <h2 className="py-2 text-lg font-semibold">
                  Người lập phiếu thu
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receipt?.user?.fullName}`}
                      alt={receipt?.user?.fullName}
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {receipt?.user?.fullName} ({receipt?.user?.code})
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">Thông tin nhân viên</div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <MobileIcon className="h-4 w-4" />
                      </div>
                      <a href={`tel:${receipt?.user?.phone}`}>
                        {receipt?.user?.phone || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${receipt?.user?.email}`}>
                        {receipt?.user?.email || 'Chưa cập nhật'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ===== End right ===== */}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>

      {editingDuePayment && (
        <UpdatePaymentDueDateDialog
          open={!!editingDuePayment}
          onOpenChange={(v) => {
            if (!v) setEditingDuePayment(null)
          }}
          payment={editingDuePayment}
          onUpdated={refreshList}
          showTrigger={false}
        />
      )}
    </Dialog>
  )
}

export default ViewReceiptDialog
