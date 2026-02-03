import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Calendar, User, Info, DollarSign, Store, FileText } from 'lucide-react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { getLotById } from '@/stores/LotSlice'
import { getPublicUrl } from '@/utils/file'

const ViewLotDialog = ({
  lotId,
  open,
  onOpenChange,
  ...props
}) => {
  const dispatch = useDispatch()
  const { lot, detailLoading: loading, error } = useSelector((state) => state.lot)

  useEffect(() => {
    if (open && lotId) {
      dispatch(getLotById(lotId))
    }
  }, [open, lotId, dispatch])

  const getStatusBadge = (status) => {
    if (status === 'active') return <Badge className="bg-green-600">Hoạt động</Badge>
    if (status === 'depleted') return <Badge variant="secondary">Cạn kiệt</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Chi tiết lô hàng: {loading ? 'Đang tải...' : lot?.code || '—'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[40px] w-full rounded-md" />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : !lot ? (
            <div className="py-12 text-center text-muted-foreground">
              Không tìm thấy thông tin lô hàng
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Banner: Product Info */}
              <div className="flex flex-col md:flex-row gap-4 bg-muted/40 p-4 rounded-lg items-start">
                {lot.product?.image && (
                  <img
                    src={getPublicUrl(lot.product.image)}
                    alt={lot.product.name}
                    className="w-20 h-20 object-cover rounded-md border bg-white"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary">{lot.product?.name}</h3>
                  <div className="text-sm text-muted-foreground mb-2">{lot.product?.code}</div>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(lot.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Đơn vị tính</div>
                  <div className="font-medium">{lot.unit?.name || '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Lot Details */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" /> Thông tin lô hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Mã lô</span>
                      <span className="font-medium">{lot.code}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Số hiệu (Batch)</span>
                      <span className="font-medium">{lot.batchNumber || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Số lượng ban đầu</span>
                      <span className="font-medium">{lot.initialQuantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Số lượng hiện tại</span>
                      <span className="font-bold text-blue-600">{lot.currentQuantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Giá vốn</span>
                      <span className="font-medium">{moneyFormat(lot.unitCost)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Tổng giá trị tồn</span>
                      <span className="font-medium">{moneyFormat(Number(lot.currentQuantity) * Number(lot.unitCost))}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Dates & Relations */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Thời gian & Liên kết
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Ngày sản xuất</span>
                      <span className="font-medium">{dateFormat(lot.manufactureDate)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Hạn sử dụng</span>
                      <span className="font-medium">{dateFormat(lot.expiryDate)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-xs">Nhà cung cấp</span>
                      <div className="font-medium flex items-center gap-1">
                        <Store className="h-3 w-3 text-muted-foreground" />
                        {lot.supplier?.name || '—'}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-xs">Phiếu nhập kho</span>
                      <div className="font-medium flex items-center gap-1 text-blue-600 cursor-pointer hover:underline" onClick={() => window.open(`/warehouse-receipts?view=${lot.warehouseReceiptId}`, '_blank')}>
                        <FileText className="h-3 w-3" />
                        {lot.warehouseReceipt?.code}
                        <span className="text-muted-foreground text-xs ml-1 font-normal">({dateFormat(lot.warehouseReceipt?.receiptDate)})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="text-xs text-muted-foreground flex gap-4 border-t pt-4">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Tạo bởi: {lot.createdByUser?.fullName} ({dateFormat(lot.createdAt, true)})
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ViewLotDialog
