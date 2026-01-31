import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { receiptTypes, warehouseReceiptStatuses } from '../data'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { getWarehouseReceiptById, updateWarehouseReceipt, postWarehouseReceipt, cancelWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import LotAllocationDialog from './LotAllocationDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { MobileIcon } from '@radix-ui/react-icons'
import { Mail, MapPin, CreditCard, Package, Printer, FileSpreadsheet } from 'lucide-react'
import { getPublicUrl } from '@/utils/file'
import { exportWarehouseReceiptToExcel } from '@/utils/export-warehouse-receipt'
import { UpdateWarehouseReceiptStatusDialog } from './UpdateWarehouseReceiptStatusDialog'
import { toast } from 'sonner'
import ViewInvoiceDialog from '../../invoice/components/ViewInvoiceDialog'

const ViewWarehouseReceiptDialog = ({
  receiptId,
  open,
  onOpenChange,
  showTrigger = true,
  isViewWarehouseDialog = true,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const dispatch = useDispatch()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lotDialogOpen, setLotDialogOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [details, setDetails] = useState([])

  const handleUpdateStatus = async (newStatus, id) => {
    try {
      if (newStatus === 'cancelled') {
        await dispatch(cancelWarehouseReceipt(id)).unwrap()
      } else if (newStatus === 'posted') {
        await dispatch(postWarehouseReceipt(id)).unwrap()
      } else {
        await dispatch(updateWarehouseReceipt({ id, data: { status: newStatus } })).unwrap()
      }

      toast.success(newStatus === 'cancelled' ? 'Hủy phiếu thành công' : newStatus === 'posted' ? 'Duyệt phiếu thành công' : 'Cập nhật trạng thái thành công')
      setShowUpdateStatusDialog(false)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchData = useCallback(async () => {
    if (!receiptId) return

    setLoading(true)
    try {
      const data = await dispatch(
        getWarehouseReceiptById(receiptId)
      ).unwrap()
      setReceipt(data)
      // Parse quantities to avoid '1.0000' strings and ensure numbers for initial state
      const parsedDetails = (data?.details || []).map(d => ({
        ...d,
        qtyDocument: parseFloat(d.qtyDocument) || 0,
        qtyActual: parseFloat(d.qtyActual) || 0
      }))
      setDetails(parsedDetails)
    } catch (error) {
      console.error('Failed to fetch receipt details:', error)
    } finally {
      setLoading(false)
    }
  }, [receiptId, dispatch])

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...details]
    // Keep as string during typing to allow decimals
    newDetails[index] = { ...newDetails[index], [field]: value }

    // If changing qtyDocument, sync to qtyActual
    if (field === 'qtyDocument') {
      newDetails[index].qtyActual = value
    }

    setDetails(newDetails)
  }

  const handleSaveChanges = async () => {
    try {
      // Construct payload for update
      // Ensure details are numbers
      const cleanDetails = details.map(d => ({
        ...d,
        qtyDocument: parseFloat(d.qtyDocument) || 0,
        qtyActual: parseFloat(d.qtyActual) || 0
      }))

      const payload = {
        ...receipt,
        details: cleanDetails
      }
      await dispatch(updateWarehouseReceipt({ id: receiptId, data: payload })).unwrap()
      toast.success('Đã lưu thay đổi')
      fetchData() // Refresh
    } catch (error) {
      console.error("Save details error:", error)
    }
  }

  useEffect(() => {
    // Chỉ fetch khi Dialog được mở
    if (open && receiptId) {
      fetchData()
    }
  }, [open, receiptId, fetchData, dispatch])

  const receiptType = receiptTypes.find((t) => t.value === receipt?.receiptType)
  const status = warehouseReceiptStatuses.find((s) => s.value === receipt?.status)
  const partner = receipt?.receiptType === 1 ? receipt?.supplier : receipt?.customer

  const handleOpenLotDialog = (detail) => {
    setSelectedDetail(detail)
    setLotDialogOpen(true)
  }

  const handleLotAllocationSuccess = () => {
    // Optionally refresh receipt data here
    fetchData()
    setLotDialogOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={cn(
          'bg-background md:h-auto md:max-w-7xl',
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader>
          <DialogTitle>
            Thông tin chi tiết phiếu kho: {receipt?.code}
          </DialogTitle>
          <DialogDescription>
            Dưới đây là thông tin chi tiết phiếu kho: {receipt?.code}
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
              {/* ===== Left: Thông tin phiếu + Sản phẩm ===== */}
              <div className="flex-1 space-y-6 rounded-lg border p-4">
                <h2 className="text-lg font-semibold">
                  Thông tin phiếu kho
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({receipt?.receiptType === 1 ? 'Nhập kho' : 'Xuất kho'})
                  </span>
                </h2>

                <div className="space-y-6">
                  {/* General Info Grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Mã phiếu:</span>
                      <p className="font-medium">{receipt?.code}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Ngày lập:</span>
                      <p className="font-medium">{receipt?.receiptDate ? dateFormat(receipt.receiptDate, true) : 'Chưa cập nhật'}</p>
                    </div>
                    {receipt?.invoice && (
                      <div>
                        <span className="text-sm text-muted-foreground">Hóa đơn:</span>
                        <p
                          className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                          onClick={() => setShowInvoiceDialog(true)}
                        >
                          {receipt.invoice.code}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">Trạng thái:</span>
                      <div className="mt-1">
                        <Badge
                          className={cn("cursor-pointer hover:opacity-80", status?.color)}
                          onClick={() => setShowUpdateStatusDialog(true)}
                        >
                          {status?.label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Lý do:</span>
                      <p className="font-medium">{receipt?.reason || 'Không có'}</p>
                    </div>
                    {receipt?.note && (
                      <div className="sm:col-span-2">
                        <span className="text-sm text-muted-foreground">Ghi chú:</span>
                        <p className="font-medium">{receipt?.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Product Details List */}
                  {details && details.length > 0 && (
                    <div className="rounded-lg border">
                      <div className="bg-secondary px-4 py-2 text-xs font-semibold">
                        Chi tiết sản phẩm
                      </div>
                      <div className="divide-y">
                        {details.map((detail, index) => (
                          <div key={detail.id || index} className="p-3">
                            <div className="flex items-start gap-3">
                              {/* Image */}
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                                {detail.product?.image ? (
                                  <img src={getPublicUrl(detail.product.image)} alt={detail.productName} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="font-medium">{detail.productName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Mã: {detail.productCode}
                                </div>
                              </div>

                              <div className="text-right space-y-2">
                                {/* Editable Quantities */}
                                {receipt?.status === 'draft' ? (
                                  <div className="flex flex-col gap-2 items-end">
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-muted-foreground">SL Chứng từ:</label>
                                      <input
                                        type="number"
                                        className="w-20 h-8 rounded-md border px-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={detail.qtyDocument || 0}
                                        onChange={(e) => handleDetailChange(index, 'qtyDocument', e.target.value)}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-muted-foreground">SL Thực tế:</label>
                                      <input
                                        type="number"
                                        className="w-20 h-8 rounded-md border px-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={detail.qtyActual || 0}
                                        onChange={(e) => handleDetailChange(index, 'qtyActual', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-end gap-2 text-sm">
                                      <span className="text-muted-foreground">CT: {parseFloat(detail.qtyDocument || 0).toLocaleString('vi-VN')}</span>
                                      <span className="text-muted-foreground">|</span>
                                      <Badge variant="outline">
                                        TT: {parseFloat(detail.qtyActual).toLocaleString('vi-VN')} {detail.unitName}
                                      </Badge>
                                    </div>
                                  </>
                                )}

                                <div className="text-sm font-medium">
                                  {moneyFormat(detail.totalAmount)}
                                </div>
                              </div>
                            </div>

                            {/* Lot Allocation Section */}
                            <div className="mt-3 border-t pt-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Lô đã chọn:</span>
                                {receipt.status === 'draft' && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenLotDialog(detail)}
                                  >
                                    {detail.lotAllocations && detail.lotAllocations.length > 0
                                      ? 'Sửa Lô'
                                      : 'Chọn Lô'}
                                  </Button>
                                )}
                              </div>

                              {detail.lotAllocations && detail.lotAllocations.length > 0 ? (
                                <div className="mt-2 space-y-1">
                                  {detail.lotAllocations.map((alloc) => (
                                    <div
                                      key={alloc.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span>• Lô {alloc.lot?.code || alloc.lotId}</span>
                                      <span className="font-medium">
                                        {parseFloat(alloc.quantity).toLocaleString('vi-VN')} {detail.unitName}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-2 text-sm text-muted-foreground italic">
                                  Chưa phân bổ lô
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Totals Section */}
                  <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                    <div></div> {/* Spacer */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <strong>Tổng số lượng:</strong>
                        <span className="font-medium">
                          {parseFloat(receipt?.totalQuantity || 0).toLocaleString(
                            'vi-VN',
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <strong>Tổng tiền:</strong>
                        <span className="font-medium text-primary">
                          {moneyFormat(receipt?.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== Right: Thông tin đối tác ===== */}
              <div className="w-full rounded-lg border p-4 lg:w-80 h-fit">
                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">
                    {receipt?.receiptType === 1 ? 'Nhà cung cấp' : 'Khách hàng'}
                  </h2>
                </div>

                {partner ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${partner.name}`}
                          alt={partner.name}
                        />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{partner.name}</div>
                        <div className="text-xs text-muted-foreground">{partner.code}</div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-medium">Thông tin chi tiết</div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        {partner.phone && (
                          <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                            <MobileIcon className="mr-2 h-4 w-4" />
                            <a href={`tel:${partner.phone}`}>{partner.phone}</a>
                          </div>
                        )}

                        {partner.identityCard && (
                          <div className="flex items-center text-muted-foreground">
                            <CreditCard className="mr-2 h-4 w-4 shrink-0" />
                            <span>{partner.identityCard}</span>
                          </div>
                        )}

                        {partner.email && (
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="mr-2 h-4 w-4" />
                            <a href={`mailto:${partner.email}`}>{partner.email}</a>
                          </div>
                        )}

                        {partner.address && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4 shrink-0" />
                            <span>{partner.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Chưa có thông tin</div>
                )}

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">Người tạo phiếu</h2>
                </div>

                {receipt?.createdByUser && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receipt.createdByUser.fullName}`}
                          alt={receipt.createdByUser.fullName}
                        />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{receipt.createdByUser.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {dateFormat(receipt.createdAt, true)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      {receipt.createdByUser.phone && (
                        <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                          <MobileIcon className="mr-2 h-4 w-4" />
                          <a href={`tel:${receipt.createdByUser.phone}`}>{receipt.createdByUser.phone}</a>
                        </div>
                      )}
                      {receipt.createdByUser.email && (
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="mr-2 h-4 w-4" />
                          <a href={`mailto:${receipt.createdByUser.email}`}>{receipt.createdByUser.email}</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter
          className={cn(
            'flex gap-2 sm:space-x-0',
            contentClassName
          )}
        >
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            {receipt?.status === 'draft' && (
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSaveChanges}
                disabled={loading}
              >
                Lưu thay đổi
              </Button>
            )}
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => exportWarehouseReceiptToExcel(receipt)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="h-4 w-4" />
              In phiếu
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Lot Allocation Dialog */}
      {selectedDetail && (
        <LotAllocationDialog
          open={lotDialogOpen}
          onOpenChange={setLotDialogOpen}
          detailId={selectedDetail.id}
          productId={selectedDetail.productId}
          productName={selectedDetail.productName}
          qtyRequired={parseFloat(selectedDetail.qtyActual)}
          existingAllocations={selectedDetail.lotAllocations || []}
          onSuccess={handleLotAllocationSuccess}
        />
      )}
      {/* Update Status Dialog */}
      {showUpdateStatusDialog && (
        <UpdateWarehouseReceiptStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          receiptId={receipt.id}
          receiptCode={receipt.code}
          currentStatus={receipt.status}
          statuses={warehouseReceiptStatuses}
          onSubmit={handleUpdateStatus}
          contentClassName="z-[10006]"
          overlayClassName="z-[10005]"
        />
      )}

      {/* View Invoice Dialog */}
      {showInvoiceDialog && receipt?.invoice && (
        <ViewInvoiceDialog
          invoiceId={receipt.invoice.id}
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          showTrigger={false}
        />
      )}
    </Dialog>
  )
}

export default ViewWarehouseReceiptDialog