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
import { Badge } from '@/components/ui/badge'

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
  const invoiceItems = receipt?.invoice?.items || []

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
                Thông tin phiếu thu
                {receipt?.invoice && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Hóa đơn: {receipt.invoice.code})
                  </span>
                )}
                {receipt?.salesContract && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Hợp đồng: {receipt.salesContract.code})
                  </span>
                )}
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
                      <div>{moneyFormat(receipt?.amount || receipt?.invoice?.totalAmount)}</div>
                    </div>
                    <div className="flex justify-start">
                      <div className="text-sm">
                        Số tiền viết bằng chữ:{' '}
                        <span className="font-medium italic">
                          {toVietnamese(receipt?.amount || receipt?.invoice?.totalAmount || 0)}
                        </span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between">
                      <strong>Trạng thái:</strong>
                      <Badge className={receipt?.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {receipt?.status === 'completed' ? 'Hoàn thành' : receipt?.status === 'draft' ? 'Nháp' : receipt?.status || 'Không xác định'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <strong>Đã thanh toán:</strong>
                      <div>{moneyFormat(receipt?.invoice?.paidAmount || 0)}</div>
                    </div>
                    <div className="flex justify-between">
                      <strong>Còn lại:</strong>
                      <div>
                        {(() => {
                          const total = parseFloat(receipt?.amount || receipt?.invoice?.totalAmount || 0)
                          const paid = parseFloat(receipt?.invoice?.paidAmount || 0)
                          const remaining = total - paid
                          return (
                            <Badge className={remaining > 0 ? 'bg-destructive' : 'bg-green-500'}>
                              {remaining > 0 ? moneyFormat(remaining) : 'Đã thanh toán hết'}
                            </Badge>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lịch sử thanh toán */}
                <Separator className="my-4" />
                <h2 className="text-lg font-semibold">Thông tin thanh toán</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <strong>Phương thức:</strong>
                    <Badge variant="outline">
                      {receipt?.paymentMethod === 'cash' ? 'Tiền mặt' : receipt?.paymentMethod === 'transfer' ? 'Chuyển khoản' : receipt?.paymentMethod || 'Không xác định'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <strong>Ngày thanh toán:</strong>
                    <span>{dateFormat(receipt?.paymentDate)}</span>
                  </div>
                  {receipt?.dueDate && (
                    <div className="flex items-center justify-between">
                      <strong>Hạn chót:</strong>
                      <span>{dateFormat(receipt?.dueDate)}</span>
                    </div>
                  )}
                  {receipt?.paymentMethod === 'transfer' && receipt?.bankName && (
                    <div className="mt-2 rounded border border-dashed p-3">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">Thông tin chuyển khoản:</div>
                      <div className="space-y-1">
                        <div><strong>Ngân hàng:</strong> {receipt.bankName}</div>
                        {receipt.bankBranch && <div><strong>Chi nhánh:</strong> {receipt.bankBranch}</div>}
                        {receipt.bankAccountNumber && <div><strong>Số TK:</strong> {receipt.bankAccountNumber}</div>}
                        {receipt.bankAccountName && <div><strong>Chủ TK:</strong> {receipt.bankAccountName}</div>}
                      </div>
                    </div>
                  )}
                </div>


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
                      src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receipt?.receiver?.name}`}
                      alt={receipt?.receiver?.name}
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{receipt?.receiver?.name}</div>
                    {receipt?.receiver?.code && (
                      <div className="text-xs text-muted-foreground">{receipt.receiver.code}</div>
                    )}
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
                      <a href={`tel:${receipt?.receiver?.phone}`}>
                        {receipt?.receiver?.phone || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${receipt?.receiver?.email}`}>
                        {receipt?.receiver?.email || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <MapPin className="h-4 w-4" />
                      </div>
                      {receipt?.receiver?.address || 'Chưa cập nhật'}
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
                      src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receipt?.createdByUser?.fullName}`}
                      alt={receipt?.createdByUser?.fullName}
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {receipt?.createdByUser?.fullName}
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
                      <a href={`tel:${receipt?.createdByUser?.phone}`}>
                        {receipt?.createdByUser?.phone || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${receipt?.createdByUser?.email}`}>
                        {receipt?.createdByUser?.email || 'Chưa cập nhật'}
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


