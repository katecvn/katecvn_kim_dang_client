import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
import { Mail, MapPin, CreditCard, Package } from 'lucide-react'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { getPublicUrl } from '@/utils/file'
import { getPaymentById, updatePaymentStatus } from '@/stores/PaymentSlice'
import UpdatePaymentStatusDialog from './UpdatePaymentStatusDialog'
import { paymentMethods } from '../../receipt/data'
import { purchaseOrderPaymentStatuses } from '../../purchase-order/data'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

const ViewPaymentDialog = ({
  payment: initialPayment,
  paymentId,
  open,
  onOpenChange,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const [fetchedPayment, setFetchedPayment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

  const payment = fetchedPayment || initialPayment

  // Payment Vouchers usually relate to a Purchase Order
  const purchaseOrder = payment?.purchaseOrder || {}
  const items = purchaseOrder?.items || []

  const dispatch = useDispatch()

  const handleUpdateStatus = async (newStatus, id) => {
    try {
      await dispatch(updatePaymentStatus({ id, status: newStatus })).unwrap()
      setShowUpdateStatusDialog(false)
      // Refetch payment to update view
      if (paymentId) {
        const result = await dispatch(getPaymentById(paymentId)).unwrap()
        setFetchedPayment(result)
      } else if (open && initialPayment) {
        // If generic usage without ID, maybe can't refresh easily unless ID is known
        if (initialPayment.id) {
          const result = await dispatch(getPaymentById(initialPayment.id)).unwrap()
          setFetchedPayment(result)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (open && paymentId && !initialPayment) {
      const fetchPayment = async () => {
        setLoading(true)
        try {
          const result = await dispatch(getPaymentById(paymentId)).unwrap()
          setFetchedPayment(result)
        } catch (error) {
          console.error("Failed to fetch payment", error)
          toast.error("Không thể tải thông tin phiếu chi")
        } finally {
          setLoading(false)
        }
      }
      fetchPayment()
    } else if (open && initialPayment) {
      setFetchedPayment(initialPayment)
      // Optional: Refetch specific details if initialPayment is partial
    }
  }, [open, paymentId, initialPayment, dispatch])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className={cn("md:h-auto md:max-w-7xl", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>
            Thông tin chi tiết phiếu chi: {payment?.code}
          </DialogTitle>
          <DialogDescription>
            Dưới đây là thông tin chi tiết phiếu chi: {payment?.code}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-auto">
          {loading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-8 w-1/3" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Skeleton className="h-64 col-span-2" />
                <Skeleton className="h-64 col-span-1" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 lg:flex-row">
              {/* ===== Left: Phiếu + bảng hàng hoá ===== */}
              <div className="flex-1 space-y-6 rounded-lg border p-4">
                <h2 className="text-lg font-semibold">
                  Thông tin phiếu chi
                  {payment?.purchaseOrder && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Đơn hàng: {payment.purchaseOrder.code})
                    </span>
                  )}
                </h2>

                <div className="space-y-6">
                  {/* Bảng sản phẩm (Nếu có thông tin đơn hàng đi kèm) */}
                  {items.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-secondary text-xs">
                            <TableHead className="w-8">TT</TableHead>
                            <TableHead className="min-w-40">Sản phẩm</TableHead>
                            <TableHead className="min-w-20">SL</TableHead>
                            <TableHead className="min-w-16">ĐVT</TableHead>
                            <TableHead className="min-w-20">Giá nhập</TableHead>
                            <TableHead className="min-w-16">Thuế</TableHead>
                            <TableHead className="min-w-28 md:w-16">
                              Giảm giá
                            </TableHead>
                            <TableHead className="min-w-28">Tổng cộng</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={item.id || index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                                    {item.product?.image ? (
                                      <img
                                        src={getPublicUrl(item.product.image)}
                                        alt={item.productName}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-secondary">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {item.productName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{item.productCode}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                {item.unitName || '—'}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(item.unitPrice)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(item.taxAmount)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(item.discountAmount || item.discount)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(item.totalAmount || item.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4 border rounded bg-secondary/20">
                      Không có thông tin sản phẩm
                    </div>
                  )}

                  {/* Tổng hợp & công nợ */}
                  <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                    <div className="text-sm">
                      <strong className="text-destructive">Lý do chi: </strong>
                      <span className="text-primary">
                        {payment?.reason || payment?.note || 'Không có'}
                      </span>
                      {payment?.note && payment.note !== payment.reason && (
                        <div className="mt-1">
                          <strong>Ghi chú thêm: </strong> {payment.note}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <strong>Số tiền chi:</strong>
                        <div className="font-bold text-lg">{moneyFormat(payment?.amount)}</div>
                      </div>
                      <div className="flex justify-start">
                        <div className="text-sm">
                          Số tiền viết bằng chữ:{' '}
                          <span className="font-medium italic">
                            {toVietnamese(payment?.amount || 0)}
                          </span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center">
                        <strong>Trạng thái:</strong>
                        <Badge
                          className={cn(
                            "cursor-pointer hover:opacity-80",
                            payment?.status === 'completed' ? 'bg-green-500' : (payment?.status === 'canceled' || payment?.status === 'cancelled') ? 'bg-red-500' : 'bg-yellow-500'
                          )}
                          onClick={() => setShowUpdateStatusDialog(true)}
                        >
                          {payment?.status === 'completed' ? 'Đã chi' : payment?.status === 'draft' ? 'Nháp' : payment?.status === 'canceled' ? 'Đã hủy' : payment?.status || 'Không xác định'}
                        </Badge>
                      </div>

                      {showUpdateStatusDialog && (
                        <UpdatePaymentStatusDialog
                          open={showUpdateStatusDialog}
                          onOpenChange={setShowUpdateStatusDialog}
                          payment={payment}
                          onSuccess={() => {
                            setShowUpdateStatusDialog(false)
                            if (paymentId) dispatch(getPaymentById(paymentId)).then(res => setFetchedPayment(res.payload))
                            else if (initialPayment?.id) dispatch(getPaymentById(initialPayment.id)).then(res => setFetchedPayment(res.payload))
                          }}
                        />
                      )}

                      {purchaseOrder && (
                        <>
                          <div className="flex justify-between mt-2">
                            <strong>Tổng đơn hàng:</strong>
                            <div>{moneyFormat(purchaseOrder.totalAmount)}</div>
                          </div>
                          <div className="flex justify-between">
                            <strong>Đã thanh toán:</strong>
                            <div>{moneyFormat(purchaseOrder.paidAmount)}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Lịch sử thanh toán */}
                  <Separator className="my-4" />
                  <h2 className="text-lg font-semibold">Thông tin thanh toán</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <strong>Phương thức:</strong>
                      <Badge variant="outline">
                        {payment?.paymentMethod === 'cash' ? 'Tiền mặt' : payment?.paymentMethod === 'transfer' ? 'Chuyển khoản' : payment?.paymentMethod || 'Không xác định'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <strong>Ngày tạo phiếu:</strong>
                      <span>{dateFormat(payment?.paymentDate || payment?.createdAt, true)}</span>
                    </div>

                    {payment?.paymentMethod === 'transfer' && payment?.bankAccount && (
                      <div className="mt-2 rounded border border-dashed p-3">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">Thông tin tài khoản nguồn (Ngân hàng Cty):</div>
                        <div className="space-y-1">
                          {payment.bankAccount?.bankName && <div><strong>Ngân hàng:</strong> {payment.bankAccount.bankName}</div>}
                          {payment.bankAccount?.accountNumber && <div><strong>Số TK:</strong> {payment.bankAccount.accountNumber}</div>}
                          {payment.bankAccount?.accountName && <div><strong>Chủ TK:</strong> {payment.bankAccount.accountName}</div>}
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              </div>

              {/* ===== Right: Nhà cung cấp & Nhân viên ===== */}
              <div className="w-full rounded-lg border p-4 lg:w-80 h-fit bg-card">
                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">Nhà cung cấp</h2>
                </div>

                <div className="space-y-6">
                  {purchaseOrder?.supplier || payment?.receiverId ? (
                    <>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?bold=true&background=random&name=${purchaseOrder?.supplier?.name || 'NCC'}`}
                            alt={purchaseOrder?.supplier?.name}
                          />
                          <AvatarFallback>NCC</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{purchaseOrder?.supplier?.name || 'Nhà cung cấp'}</div>
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
                            <a href={`tel:${purchaseOrder?.supplier?.phone}`}>
                              {purchaseOrder?.supplier?.phone || 'Chưa cập nhật'}
                            </a>
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <Mail className="h-4 w-4" />
                            </div>
                            <a href={`mailto:${purchaseOrder?.supplier?.email}`}>
                              {purchaseOrder?.supplier?.email || 'Chưa cập nhật'}
                            </a>
                          </div>

                          <div className="flex items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <MapPin className="h-4 w-4" />
                            </div>
                            {purchaseOrder?.supplier?.address || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Không có thông tin nhà cung cấp</div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">
                    Người tạo phiếu
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?bold=true&background=random&name=${payment?.createdByUser?.fullName}`}
                        alt={payment?.createdByUser?.fullName}
                      />
                      <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {payment?.createdByUser?.fullName || payment?.createdBy}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateFormat(payment?.createdAt, true)}
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
                        <a href={`tel:${payment?.createdByUser?.phone}`}>
                          {payment?.createdByUser?.phone || 'Chưa cập nhật'}
                        </a>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <div className="mr-2 h-4 w-4 ">
                          <Mail className="h-4 w-4" />
                        </div>
                        <a href={`mailto:${payment?.createdByUser?.email}`}>
                          {payment?.createdByUser?.email || 'Chưa cập nhật'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ===== End right ===== */}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>


    </Dialog>
  )
}

export default ViewPaymentDialog
