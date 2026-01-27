import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { statuses } from '../data'
import { statuses as contractStatuses } from '../../sales-contract/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { IconInfoCircle } from '@tabler/icons-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { dateFormat } from '@/utils/date-format'
import { Skeleton } from '@/components/ui/skeleton'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteCreditNoteById,
  getCreditNotesByInvoiceId,
  updateCreditNoteStatus,
} from '@/stores/CreditNoteSlice'
import { toast } from 'sonner'
import ConfirmActionButton from '@/components/custom/ConfirmActionButton'
import UpdateCreditNoteDialog from './UpdateCreditNoteDialog'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import InstallmentPreviewDialog from './InstallmentPreviewDialog'
import { buildInstallmentData } from '../helpers/BuildInstallmentData'
import { exportInstallmentWord } from '../helpers/ExportInstallmentWord'

const ViewInvoiceDialog = ({ invoiceId, showTrigger = true, ...props }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const creditNotes = useSelector(
    (state) => state.creditNote.creditNotesByInvoiceId,
  )
  const dispatch = useDispatch()
  const [openUpdateCN, setOpenUpdateCN] = useState(false)
  const [editingCN, setEditingCN] = useState(null)

  // State cho In Hợp Đồng
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-tra-cham.docx')
  const [installmentExporting, setInstallmentExporting] = useState(false)
  const fetchData = useCallback(async () => {
    setLoading(true)

    try {
      const getAdminInvoice = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('GET_INVOICE')

      const data = getAdminInvoice
        ? await getInvoiceDetail(invoiceId)
        : await getInvoiceDetailByUser(invoiceId)

      setInvoice(data)
    } catch (error) {
      setLoading(false)
      console.log('Fetch invoice detail error:', error)
    } finally {
      setLoading(false)
    }
  }, [invoiceId])

  useEffect(() => {
    fetchData()
    dispatch(getCreditNotesByInvoiceId(invoiceId))
  }, [invoiceId, fetchData, dispatch])

  const handleApproveCreditNote = async (creditNote) => {
    if (creditNote.status === 'accepted') {
      toast.warning('Hóa đơn đã được duyệt')
      return
    }

    const dataToSend = {
      id: creditNote.id,
      status: 'accepted',
    }

    try {
      await dispatch(updateCreditNoteStatus(dataToSend)).unwrap()
      toast.success(`Đã duyệt hóa đơn âm ${creditNote.code}`)
      await dispatch(getCreditNotesByInvoiceId(invoiceId)).unwrap()
    } catch (err) {
      toast.error('Không thể duyệt hóa đơn. Vui lòng thử lại.')
    }
  }

  const handleEditCreditNote = (creditNote) => {
    setEditingCN(creditNote)
    setOpenUpdateCN(true)
  }

  const handleDeleteCreditNote = async (creditNote) => {
    try {
      await dispatch(deleteCreditNoteById(creditNote.id)).unwrap()
      toast.success(`Đã xóa hóa đơn điều chỉnh ${creditNote.code}`)
      await dispatch(getCreditNotesByInvoiceId(invoiceId)).unwrap()
    } catch (err) {
      toast.error('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  const handlePrintContract = async () => {
    if (!invoice?.salesContract || Object.keys(invoice.salesContract).length === 0) {
      toast.warning('Đơn bán này không lập hợp đồng')
      return
    }

    try {
      const baseInstallmentData = await buildInstallmentData(invoice)
      setInstallmentData(baseInstallmentData)
      setInstallmentFileName(`hop-dong-tra-cham-${invoice.code || 'contract'}.docx`)
      setShowInstallmentPreview(true)
    } catch (error) {
      console.error('Load installment data error:', error)
      toast.error('Không lấy được dữ liệu hợp đồng trả chậm')
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className={cn(
        "md:h-auto md:max-w-full md:z-50",
        !isDesktop && "h-screen max-h-screen w-screen max-w-none m-0 p-0 rounded-none z-[9998]"
      )}>
        <DialogHeader className={cn(!isDesktop && "px-4 pt-4")}>
          <DialogTitle className={cn(!isDesktop && "text-base")}>
            Thông tin chi tiết hóa đơn: {invoice?.code}
          </DialogTitle>
          <DialogDescription className={cn(!isDesktop && "text-xs")}>
            Dưới đây là thông tin chi tiết hóa đơn: {invoice?.code}.
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "overflow-auto",
          isDesktop ? "max-h-[75vh]" : "h-full px-4 pb-4"
        )}>
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
              <div className={cn(
                "flex gap-6",
                isDesktop ? "flex-row" : "flex-col"
              )}>
                <div className={cn(
                  "flex-1 rounded-lg border",
                  isDesktop ? "space-y-6 p-4" : "space-y-4 p-3"
                )}>
                  <h2 className={cn(
                    "font-semibold",
                    isDesktop ? "text-lg" : "text-base"
                  )}>Thông tin đơn</h2>



                  <div className={cn("space-y-6", !isDesktop && "space-y-4")}>
                    {/* Product Items - Table on Desktop, Cards on Mobile */}
                    {isDesktop ? (
                      <div className="overflow-x-auto rounded-lg border">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="bg-secondary text-xs">
                              <TableHead className="w-8">TT</TableHead>
                              <TableHead className="min-w-40">Sản phẩm</TableHead>
                              <TableHead className="min-w-20">SL</TableHead>
                              <TableHead className="min-w-16">Tặng</TableHead>
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
                              <TableHead className="min-w-28">Ghi chú</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoice?.invoiceItems.map((product, index) => (
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
                                          ?.filter((option) => !!option.code)
                                          ?.map(
                                            (option) =>
                                              `${option.name} ${option?.pivot?.value || ''}`,
                                          )
                                          .join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>{product.giveaway}</TableCell>
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
                                  {product?.warranties[0]?.periodMonths &&
                                    product.warranty
                                    ? `${product.warranty}`
                                    : 'Không có'}
                                </TableCell>
                                <TableCell>
                                  {product.note || 'Không có'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invoice?.invoiceItems.map((product, index) => (
                          <div key={product.id} className="border rounded-lg p-3 space-y-2 bg-card">
                            {/* Header: STT + Product Name */}
                            <div className="font-medium text-sm">
                              {index + 1}. {product.productName}
                            </div>

                            {/* Options if any */}
                            {product?.options && (
                              <div className="text-xs text-muted-foreground">
                                {product.options
                                  ?.filter((option) => !!option.code)
                                  ?.map((option) => `${option.name} ${option?.pivot?.value || ''}`)
                                  .join(', ')}
                              </div>
                            )}

                            {/* Grid of details */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">SL: </span>
                                <span className="font-medium">{product.quantity}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tặng: </span>
                                <span className="font-medium">{product.giveaway}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">ĐVT: </span>
                                <span className="font-medium">{product.unitName || 'Không có'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Giá: </span>
                                <span className="font-medium">{moneyFormat(product.price)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Thuế: </span>
                                <span className="font-medium">{moneyFormat(product.taxAmount)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Giảm: </span>
                                <span className="font-medium text-red-500">{moneyFormat(product.discount)}</span>
                              </div>
                            </div>

                            {/* Total - prominent */}
                            <div className="flex justify-between border-t pt-2 font-semibold text-sm">
                              <span>Tổng cộng:</span>
                              <span className="text-primary">{moneyFormat(product.total)}</span>
                            </div>

                            {/* Warranty & Note */}
                            <div className="text-xs space-y-1 border-t pt-2">
                              <div>
                                <span className="text-muted-foreground">BH: </span>
                                <span>{product?.warranties[0]?.periodMonths && product.warranty ? product.warranty : 'Không có'}</span>
                              </div>
                              {product.note && (
                                <div>
                                  <span className="text-muted-foreground">Ghi chú: </span>
                                  <span>{product.note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={cn(
                      "grid gap-4",
                      isDesktop ? "md:grid-cols-[2fr,1fr]" : "grid-cols-1"
                    )}>
                      {/* Totals Section - Order 1 on mobile, Order 2 on desktop */}
                      <div className={cn(
                        "space-y-4 text-sm",
                        isDesktop ? "order-2" : "order-1"
                      )}>
                        <div className="flex justify-between">
                          <strong>Giảm giá:</strong>
                          <span>{moneyFormat(invoice?.discount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <strong>Thuế:</strong>
                          <span>{moneyFormat(invoice?.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <strong>Phí vận chuyển: </strong>
                          <span>
                            {moneyFormat(invoice?.otherExpenses?.price || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <strong>Tổng cộng:</strong>
                          <span>{moneyFormat(invoice?.amount)}</span>
                        </div>
                        <div className="flex justify-start border-t py-2">
                          <div className={cn("font-bold", isDesktop ? "text-sm" : "text-xs")}>
                            Số tiền viết bằng chữ:{' '}
                            <span className="font-bold">
                              {toVietnamese(invoice?.amount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-start border-t py-2">
                          <strong>Trạng thái hóa đơn: </strong>
                          {invoice?.status && (
                            <span
                              className={`ml-2 flex items-center ${statuses.find(
                                (status) => status.value === invoice?.status,
                              )?.color || ''
                                }`}
                            >
                              {React.createElement(
                                statuses.find(
                                  (status) => status.value === invoice?.status,
                                )?.icon,
                                { className: 'mr-1 h-4 w-4' },
                              )}
                              {
                                statuses.find(
                                  (status) => status.value === invoice?.status,
                                )?.label
                              }
                            </span>
                          )}
                        </div>

                        <Separator className="my-3" />

                        {/* Payment Status & Info */}
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <strong>Trạng thái thanh toán:</strong>
                            {invoice?.paymentStatus && (
                              <span
                                className={`font-medium ${invoice.paymentStatus === 'paid'
                                  ? 'text-green-600'
                                  : invoice.paymentStatus === 'partial'
                                    ? 'text-orange-600'
                                    : 'text-red-600'
                                  }`}
                              >
                                {invoice.paymentStatus === 'paid'
                                  ? 'Đã thanh toán'
                                  : invoice.paymentStatus === 'partial'
                                    ? 'Thanh toán một phần'
                                    : 'Chưa thanh toán'}
                              </span>
                            )}
                          </div>

                          {invoice?.paidAmount > 0 && (
                            <div className="flex justify-between">
                              <strong>Đã thanh toán:</strong>
                              <span className="font-medium text-green-600">
                                {moneyFormat(invoice.paidAmount)}
                              </span>
                            </div>
                          )}

                          {invoice?.paidAmount < invoice?.amount && (
                            <div className="flex justify-between">
                              <strong>Còn lại:</strong>
                              <span className="font-medium text-red-600">
                                {moneyFormat(invoice.amount - (invoice.paidAmount || 0))}
                              </span>
                            </div>
                          )}

                          {invoice?.paymentMethod && (
                            <div className="flex justify-between">
                              <strong>Phương thức thanh toán:</strong>
                              <span>
                                {invoice.paymentMethod === 'cash'
                                  ? 'Tiền mặt'
                                  : invoice.paymentMethod === 'transfer'
                                    ? 'Chuyển khoản'
                                    : invoice.paymentMethod}
                              </span>
                            </div>
                          )}

                          {invoice?.expectedDeliveryDate && (
                            <div className="flex justify-between">
                              <strong>Ngày giao hàng dự kiến:</strong>
                              <span className="font-medium text-orange-600">
                                {dateFormat(invoice.expectedDeliveryDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes Section - Order 2 on mobile, Order 1 on desktop */}
                      <div className={cn(
                        "flex flex-col gap-2",
                        isDesktop ? "order-1" : "order-2"
                      )}>
                        <div className={cn(isDesktop ? "text-sm" : "text-xs")}>
                          <strong className="text-destructive">
                            Ghi chú:{' '}
                          </strong>
                          <span className="text-primary">
                            {invoice?.note || 'Không có'}
                          </span>
                        </div>
                        {invoice?.expires?.length > 0 && (
                          <div className={cn(isDesktop ? "text-sm" : "text-xs")}>
                            <strong className="text-destructive">
                              Thông tin quản lý hạn dùng:
                            </strong>
                            <ul className="ml-4 list-disc text-primary">
                              {invoice.expires.map((exp) => {
                                const matchedProduct =
                                  invoice.invoiceItems?.find(
                                    (item) => item.productId === exp.productId,
                                  )

                                return (
                                  <li key={exp.id}>
                                    <span className="font-medium">
                                      {matchedProduct?.productName ||
                                        `Sản phẩm ID ${exp.productId}`}
                                    </span>
                                    {': '}
                                    từ{' '}
                                    <strong>
                                      {dateFormat(exp.startDate)}
                                    </strong>{' '}
                                    đến{' '}
                                    <strong>{dateFormat(exp.endDate)}</strong>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ========== HỢP ĐỒNG BÁN HÀNG ========== */}
                    {invoice?.salesContract && (
                      <>
                        <Separator className="my-4" />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Hợp đồng bán hàng</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePrintContract}
                              loading={installmentExporting}
                            >
                              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              In hợp đồng
                            </Button>
                          </div>

                          <div className="space-y-3 rounded-lg border p-4 text-sm">
                            <div className="flex justify-between">
                              <strong>Mã hợp đồng:</strong>
                              <span className="font-medium text-primary">{invoice.salesContract.code}</span>
                            </div>

                            <div className="flex justify-between">
                              <strong>Trạng thái:</strong>
                              {(() => {
                                const statusInfo = contractStatuses.find(
                                  (s) => s.value === invoice.salesContract.status
                                )
                                return statusInfo ? (
                                  <span className={`font-medium flex items-center ${statusInfo.color}`}>
                                    {React.createElement(statusInfo.icon, { className: 'mr-1 h-4 w-4' })}
                                    {statusInfo.label}
                                  </span>
                                ) : (
                                  <span className="font-medium text-gray-600">
                                    {invoice.salesContract.status}
                                  </span>
                                )
                              })()}
                            </div>

                            <div className="flex justify-between">
                              <strong>Ngày hợp đồng:</strong>
                              <span>{dateFormat(invoice.salesContract.contractDate)}</span>
                            </div>

                            <div className="flex justify-between">
                              <strong>Ngày giao hàng:</strong>
                              <span className="font-medium text-orange-600">
                                {dateFormat(invoice.salesContract.deliveryDate)}
                              </span>
                            </div>

                            <div className="flex justify-between border-t pt-2">
                              <strong>Tổng giá trị:</strong>
                              <span className="font-bold text-primary">
                                {moneyFormat(invoice.salesContract.totalAmount)}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <strong>Đã thanh toán:</strong>
                              <span className="font-medium text-green-600">
                                {moneyFormat(invoice.salesContract.paidAmount || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Contract Items Table */}
                          {invoice.salesContract.items && invoice.salesContract.items.length > 0 && (
                            <div className="overflow-x-auto rounded-lg border">
                              <Table className="min-w-full">
                                <TableHeader>
                                  <TableRow className="bg-secondary text-xs">
                                    <TableHead className="w-8">TT</TableHead>
                                    <TableHead className="min-w-40">Sản phẩm</TableHead>
                                    <TableHead className="min-w-20 text-right">Số lượng</TableHead>
                                    <TableHead className="min-w-28 text-right">Đơn giá</TableHead>
                                    <TableHead className="min-w-28 text-right">Thành tiền</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {invoice.salesContract.items.map((item, index) => (
                                    <TableRow key={item.id || index}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell className="font-medium">{item.productName}</TableCell>
                                      <TableCell className="text-right">{parseInt(item.quantity)}</TableCell>
                                      <TableCell className="text-right">{moneyFormat(item.unitPrice)}</TableCell>
                                      <TableCell className="text-right font-medium">{moneyFormat(item.totalAmount)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* ========== PHIẾU XUẤT KHO ========== */}
                    {invoice?.warehouseReceipt && (
                      <>
                        <Separator className="my-4" />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Phiếu xuất kho</h3>
                          </div>

                          <div className="space-y-3 rounded-lg border p-4 text-sm">
                            <div className="flex justify-between">
                              <strong>Mã phiếu kho:</strong>
                              <span className="font-medium text-primary">
                                {invoice.warehouseReceipt.code}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <strong>Loại phiếu:</strong>
                              <span className="font-medium">
                                {invoice.warehouseReceipt.type === 'EXPORT'
                                  ? 'Xuất kho'
                                  : invoice.warehouseReceipt.type === 'IMPORT_RETURN'
                                    ? 'Nhập trả hàng'
                                    : invoice.warehouseReceipt.type}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <strong>Trạng thái:</strong>
                              <span
                                className={`font-medium ${invoice.warehouseReceipt.status === 'DRAFT'
                                  ? 'text-yellow-600'
                                  : invoice.warehouseReceipt.status === 'POSTED'
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                                  }`}
                              >
                                {invoice.warehouseReceipt.status === 'DRAFT'
                                  ? 'Nháp'
                                  : invoice.warehouseReceipt.status === 'POSTED'
                                    ? 'Đã ghi sổ'
                                    : invoice.warehouseReceipt.status}
                              </span>
                            </div>

                            <div className="flex justify-between border-t pt-2">
                              <strong>Ngày tạo:</strong>
                              <span>{dateFormat(invoice.warehouseReceipt.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ========== PHIẾU THU/CHI ========== */}
                    {invoice?.paymentVouchers && invoice.paymentVouchers.length > 0 && (
                      <>
                        <Separator className="my-4" />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Phiếu thu/chi</h3>
                          </div>

                          <div className="overflow-x-auto rounded-lg border">
                            <Table className="min-w-full">
                              <TableHeader>
                                <TableRow className="bg-secondary text-xs">
                                  <TableHead className="min-w-32">Mã phiếu</TableHead>
                                  <TableHead className="min-w-28 text-right">Số tiền</TableHead>
                                  <TableHead className="min-w-24">PT thanh toán</TableHead>
                                  <TableHead className="min-w-20">Trạng thái</TableHead>
                                  <TableHead className="min-w-20">Loại GD</TableHead>
                                  <TableHead className="min-w-32">Người tạo</TableHead>
                                  <TableHead className="min-w-32">Ngày tạo</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {invoice.paymentVouchers.map((voucher) => (
                                  <TableRow key={voucher.id}>
                                    <TableCell className="font-medium text-primary">
                                      {voucher.code}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {moneyFormat(voucher.amount)}
                                    </TableCell>
                                    <TableCell>
                                      {voucher.paymentMethod === 'cash'
                                        ? 'Tiền mặt'
                                        : voucher.paymentMethod === 'transfer'
                                          ? 'Chuyển khoản'
                                          : voucher.paymentMethod}
                                    </TableCell>
                                    <TableCell>
                                      <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${voucher.status === 'completed'
                                          ? 'bg-green-100 text-green-700'
                                          : voucher.status === 'draft'
                                            ? 'bg-gray-100 text-gray-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                          }`}
                                      >
                                        {voucher.status === 'completed'
                                          ? 'Hoàn thành'
                                          : voucher.status === 'draft'
                                            ? 'Nháp'
                                            : voucher.status}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {voucher.transactionType === 'payment'
                                        ? 'Thanh toán'
                                        : voucher.transactionType === 'deposit'
                                          ? 'Đặt cọc'
                                          : voucher.transactionType === 'refund'
                                            ? 'Hoàn tiền'
                                            : voucher.transactionType}
                                    </TableCell>
                                    <TableCell>
                                      {voucher.createdByUser?.fullName || '—'}
                                    </TableCell>
                                    <TableCell>{dateFormat(voucher.createdAt)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator className="my-4" />

                    <div className={cn(
                      "grid gap-4",
                      isDesktop ? "md:grid-cols-2" : "grid-cols-1"
                    )}>
                      {/* Cột trái: Lịch sử */}
                      <div>
                        <h3 className={cn(
                          "mb-2 font-semibold",
                          isDesktop ? "text-base" : "text-sm"
                        )}>Lịch sử</h3>
                        <ol className="relative border-s border-primary dark:border-primary">
                          {invoice?.invoiceHistories?.length ? (
                            invoice?.invoiceHistories.map((history) => (
                              <li className="mb-3 ms-4" key={history.id}>
                                <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-primary bg-primary dark:border-primary dark:bg-primary"></div>
                                <time className="mb-1 text-sm font-normal leading-none">
                                  {dateFormat(history.createdAt, true)}
                                </time>
                                <p className="text-xs">{history.description}</p>
                              </li>
                            ))
                          ) : (
                            <p className="text-muted-foreground">
                              Không có lịch sử thay đổi
                            </p>
                          )}
                        </ol>
                      </div>

                      {/* Cột phải: Hóa đơn âm (Credit notes) */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className={cn(
                            "font-semibold",
                            isDesktop ? "text-base" : "text-sm"
                          )}>Hóa đơn điều chỉnh</h3>
                        </div>

                        <div className="overflow-x-auto rounded-lg border">
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead className="min-w-40">Mã</TableHead>
                                <TableHead className="min-w-[220px]">
                                  Sản phẩm
                                </TableHead>
                                <TableHead className="min-w-28">
                                  Trạng thái
                                </TableHead>
                                <TableHead className="min-w-28 text-right">
                                  Giá
                                </TableHead>
                                <TableHead className="w-24 text-center">
                                  Hành động
                                </TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {creditNotes?.length ? (
                                creditNotes.map((cn) => {
                                  const statusMeta =
                                    statuses?.find(
                                      (s) => s.value === cn.status,
                                    ) || null

                                  return (
                                    <TableRow key={cn.id}>
                                      <TableCell className="whitespace-nowrap">
                                        {cn.code}
                                      </TableCell>

                                      {/* Sản phẩm xSL, tô màu cam cho số lượng */}
                                      <TableCell className="break-words">
                                        {cn?.invoiceItems?.length
                                          ? cn.invoiceItems.map((ii, idx) => (
                                            <span
                                              key={ii.id ?? idx}
                                              className="inline"
                                            >
                                              {ii.productName}{' '}
                                              {ii.quantity ? (
                                                <span className="font-semibold text-orange-500">
                                                  x{ii.quantity}
                                                </span>
                                              ) : null}
                                              {idx <
                                                cn.invoiceItems.length - 1
                                                ? ', '
                                                : ''}
                                            </span>
                                          ))
                                          : '—'}
                                      </TableCell>

                                      {/* Trạng thái */}
                                      <TableCell>
                                        {statusMeta ? (
                                          <ConfirmActionButton
                                            title="Xác nhận duyệt hóa đơn điều chỉnh"
                                            description={`Bạn có chắc muốn duyệt hóa đơn điều chỉnh ${cn.code}?`}
                                            confirmText="Duyệt"
                                            onConfirm={() =>
                                              handleApproveCreditNote(cn)
                                            }
                                          >
                                            <button
                                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition hover:opacity-80 ${statusMeta.color}`}
                                            >
                                              {statusMeta.icon &&
                                                React.createElement(
                                                  statusMeta.icon,
                                                  {
                                                    className: 'h-3 w-3',
                                                  },
                                                )}
                                              {statusMeta.label}
                                            </button>
                                          </ConfirmActionButton>
                                        ) : (
                                          <span className="text-muted-foreground">
                                            —
                                          </span>
                                        )}
                                      </TableCell>

                                      <TableCell className="text-right">
                                        {moneyFormat(cn.amount)}
                                      </TableCell>

                                      <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          {/* Edit */}
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleEditCreditNote(cn)
                                                  }
                                                  className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs hover:bg-accent"
                                                  aria-label={`Sửa ${cn.code}`}
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </button>
                                              </TooltipTrigger>{' '}
                                              <TooltipContent>
                                                Sửa
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>

                                          {editingCN && (
                                            <UpdateCreditNoteDialog
                                              key={editingCN.id}
                                              open={openUpdateCN}
                                              onOpenChange={async (v) => {
                                                setOpenUpdateCN(v)
                                                if (!v) {
                                                  try {
                                                    await dispatch(
                                                      getCreditNotesByInvoiceId(
                                                        invoiceId,
                                                      ),
                                                    ).unwrap()
                                                  } catch { }
                                                }
                                              }}
                                              creditNote={editingCN}
                                              showTrigger={false}
                                            />
                                          )}

                                          {/* Delete (confirm) */}
                                          <ConfirmActionButton
                                            title="Xác nhận xóa"
                                            description={`Bạn có chắc muốn xóa hóa đơn điều chỉnh ${cn.code}? Hành động này không thể hoàn tác.`}
                                            confirmText="Xóa"
                                            onConfirm={() =>
                                              handleDeleteCreditNote(cn)
                                            }
                                          >
                                            <button
                                              type="button"
                                              className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs text-destructive hover:bg-accent"
                                              aria-label={`Xóa ${cn.code}`}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </ConfirmActionButton>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                  >
                                    Không có hóa đơn điều chỉnh
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "rounded-lg border p-4",
                  isDesktop ? "w-72" : "w-full"
                )}>
                  <div className="flex items-center justify-between">
                    <h2 className={cn(
                      "py-2 font-semibold",
                      isDesktop ? "text-lg" : "text-base"
                    )}>Khách hàng</h2>
                  </div>

                  <div className={cn(isDesktop ? "space-y-6" : "space-y-4")}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${invoice?.customer?.name}`}
                          alt={invoice?.customer?.name}
                        />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {invoice?.customer?.name}
                        </div>
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
                          <a href={`tel:${invoice?.customer?.phone}`}>
                            {invoice?.customer?.phone || 'Chưa cập nhật'}
                          </a>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <Mail className="h-4 w-4" />
                          </div>
                          <a href={`mailto:${invoice?.customer?.email}`}>
                            {invoice?.customer?.email || 'Chưa cập nhật'}
                          </a>
                        </div>

                        <div className="flex items-center text-primary hover:text-secondary-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <MapPin className="h-4 w-4" />
                          </div>
                          {invoice?.customer?.address || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <h2 className="py-2 text-lg font-semibold">
                      Người lập hóa đơn
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${invoice?.user?.fullName}`}
                          alt={invoice?.user?.fullName}
                        />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {invoice?.user?.fullName} ({invoice?.user.code})
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
                          <a href={`tel:${invoice?.user?.phone}`}>
                            {invoice?.user?.phone || 'Chưa cập nhật'}
                          </a>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <Mail className="h-4 w-4" />
                          </div>
                          <a href={`mailto:${invoice?.user?.email}`}>
                            {invoice?.user?.email || 'Chưa cập nhật'}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {invoice?.invoiceRevenueShare && (
                    <>
                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <h2 className="py-2 text-lg font-semibold">
                          Tỉ lệ hưởng doanh số
                        </h2>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <strong>Người được chia: </strong>
                          <div className="flex items-center gap-1">
                            {invoice?.invoiceRevenueShare?.user.fullName}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <IconInfoCircle className="h-4 w-4 cursor-pointer text-primary hover:text-secondary-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      Mã nhân viên:{' '}
                                      {invoice?.invoiceRevenueShare?.user.code}
                                    </div>

                                    <div className="font-medium">
                                      Số điện thoại:{' '}
                                      <a
                                        href={`tel:${invoice?.invoiceRevenueShare?.user.phone}`}
                                      >
                                        {invoice?.invoiceRevenueShare?.user
                                          .phone || 'Chưa cập nhật'}
                                      </a>
                                    </div>

                                    <div className="font-medium">
                                      Địa chỉ email:{' '}
                                      <a
                                        href={`tel:${invoice?.invoiceRevenueShare?.user.email}`}
                                      >
                                        {invoice?.invoiceRevenueShare?.user
                                          .email || 'Chưa cập nhật'}
                                      </a>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <strong>Tỉ lệ chia: </strong>
                          <span>
                            {invoice?.invoiceRevenueShare?.sharePercentage *
                              100}
                            %
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <strong>Số tiền được chia: </strong>
                          <span className="text-primary">
                            {moneyFormat(invoice?.invoiceRevenueShare?.amount)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </div>
            </>
          )}
        </div>

        {/* InstallmentPreviewDialog cho In Hợp Đồng */}
        {installmentData && (
          <InstallmentPreviewDialog
            open={showInstallmentPreview}
            onOpenChange={(open) => {
              if (!open) setShowInstallmentPreview(false)
            }}
            initialData={installmentData}
            onConfirm={async (finalData) => {
              try {
                setInstallmentExporting(true)
                await exportInstallmentWord(finalData, installmentFileName)
                toast.success('Đã xuất hợp đồng trả chậm thành công')
                setShowInstallmentPreview(false)
              } catch (error) {
                console.error('Export installment error:', error)
                toast.error('Xuất hợp đồng trả chậm thất bại')
              } finally {
                setInstallmentExporting(false)
              }
            }}
          />
        )}

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

export default ViewInvoiceDialog
