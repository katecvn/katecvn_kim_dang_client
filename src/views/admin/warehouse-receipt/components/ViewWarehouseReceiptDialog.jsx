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
import { getWarehouseReceiptById } from '@/stores/WarehouseReceiptSlice'
import LotAllocationDialog from './LotAllocationDialog'

const ViewWarehouseReceiptDialog = ({
  receiptId,
  open,
  onOpenChange,
  showTrigger = true,
  isViewWarehouseDialog = true,
  ...props
}) => {
  console.log(receiptId)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const dispatch = useDispatch()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lotDialogOpen, setLotDialogOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState(null)

  const fetchData = useCallback(async () => {
    if (!receiptId) return

    setLoading(true)
    try {
      const data = await dispatch(
        getWarehouseReceiptById(receiptId)
      ).unwrap()
      console.log('detailedReceipt', data)
      setReceipt(data)
    } catch (error) {
      console.error('Failed to fetch receipt details:', error)
    } finally {
      setLoading(false)
    }
  }, [receiptId, dispatch])

  console.log('detailedReceipt out', receipt)

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
          'md:h-screen md:max-w-full md:z-50 md:my-0 md:top-0 md:translate-y-0',
          !isDesktop &&
          isViewWarehouseDialog &&
          'fixed inset-0 z-[9999] m-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none p-0'
        )}
      >
        <DialogHeader className={cn(!isDesktop && 'px-4 pt-4')}>
          <DialogTitle className={cn(!isDesktop && 'text-base')}>
            Thông tin chi tiết phiếu kho: {receipt?.code}
          </DialogTitle>
          <DialogDescription className={cn(!isDesktop && 'text-xs')}>
            Dưới đây là thông tin chi tiết phiếu kho: {receipt?.code}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'overflow-auto',
            isDesktop ? 'max-h-[75vh]' : 'h-full px-4 pb-4'
          )}
        >
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <Skeleton className="mb-3 h-6 w-40" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Receipt Information */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-lg font-semibold">Thông tin phiếu</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Mã phiếu:
                    </span>
                    <p className="font-medium">{receipt?.code}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Loại phiếu:
                    </span>
                    <div className="mt-1">
                      <Badge className={receiptType?.color}>
                        {receiptType?.label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Ngày lập:
                    </span>
                    <p className="font-medium">
                      {dateFormat(receipt?.receiptDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Trạng thái:
                    </span>
                    <div className="mt-1">
                      <Badge className={status?.color}>{status?.label}</Badge>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-sm text-muted-foreground">Lý do:</span>
                    <p className="font-medium">{receipt?.reason || 'Không có'}</p>
                  </div>
                  {receipt?.note && (
                    <div className="sm:col-span-2">
                      <span className="text-sm text-muted-foreground">
                        Ghi chú:
                      </span>
                      <p className="font-medium">{receipt?.note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Partner Information */}
              {partner && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 text-lg font-semibold">
                    {receipt?.receiptType === 1 ? 'Nhà cung cấp' : 'Khách hàng'}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Mã:</span>
                      <p className="font-medium">{partner.code}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Tên:</span>
                      <p className="font-medium">{partner.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Details */}
              {receipt?.details && receipt.details.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 text-lg font-semibold">Chi tiết sản phẩm</h3>
                  <div className="space-y-3">
                    {receipt.details.map((detail, index) => (
                      <div key={detail.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-medium">{detail.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              Mã: {detail.productCode}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {parseFloat(detail.qtyActual).toLocaleString('vi-VN')} {detail.unitName}
                          </Badge>
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

              {/* Totals */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-lg font-semibold">Tổng hợp</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Tổng số lượng:
                    </span>
                    <p className="font-medium">
                      {parseFloat(receipt?.totalQuantity || 0).toLocaleString(
                        'vi-VN',
                        {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Tổng tiền:
                    </span>
                    <p className="font-medium text-primary">
                      {moneyFormat(receipt?.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter
          className={cn(
            'flex gap-2 sm:space-x-0',
            !isDesktop && 'p-4 pt-0 shadow-inner'
          )}
        >
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Đóng
            </Button>
          </DialogClose>
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
    </Dialog>
  )
}

export default ViewWarehouseReceiptDialog