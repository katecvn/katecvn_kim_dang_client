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
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { receiptTypes, receiptStatuses } from '../data'

const ViewWarehouseReceiptDialog = ({
  receipt,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const receiptType = receiptTypes.find((t) => t.value === receipt?.receiptType)
  const status = receiptStatuses.find((s) => s.value === receipt?.status)
  const partner = receipt?.receiptType === 1 ? receipt?.supplier : receipt?.customer

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="md:h-auto md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Thông tin chi tiết phiếu kho: {receipt?.code}
          </DialogTitle>
          <DialogDescription>
            Dưới đây là thông tin chi tiết phiếu kho: {receipt?.code}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto">
          <div className="space-y-4">
            {/* Receipt Information */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-lg font-semibold">Thông tin phiếu</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">Mã phiếu:</span>
                  <p className="font-medium">{receipt?.code}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Loại phiếu:</span>
                  <div className="mt-1">
                    <Badge className={receiptType?.color}>
                      {receiptType?.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ngày lập:</span>
                  <p className="font-medium">{dateFormat(receipt?.receiptDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Trạng thái:</span>
                  <div className="mt-1">
                    <Badge className={status?.color}>
                      {status?.label}
                    </Badge>
                  </div>
                </div>
                <div className="sm:col-span-2">
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

            {/* Totals */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-lg font-semibold">Tổng hợp</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">Tổng số lượng:</span>
                  <p className="font-medium">
                    {parseFloat(receipt?.totalQuantity || 0).toLocaleString('vi-VN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tổng tiền:</span>
                  <p className="font-medium text-primary">
                    {moneyFormat(receipt?.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
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
    </Dialog>
  )
}

export default ViewWarehouseReceiptDialog
