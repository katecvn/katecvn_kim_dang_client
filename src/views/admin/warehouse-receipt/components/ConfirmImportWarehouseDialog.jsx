import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getPurchaseOrderDetail } from '@/stores/PurchaseOrderSlice'
import { generateWarehouseReceiptFromPO } from '@/stores/WarehouseReceiptSlice'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconPackageImport } from '@tabler/icons-react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const ConfirmImportWarehouseDialog = ({
  open,
  onOpenChange,
  purchaseOrderId,
  onConfirm,
  contentClassName,
  overlayClassName,
}) => {
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if (open && purchaseOrderId) {
      setLoading(true)
      dispatch(getPurchaseOrderDetail(purchaseOrderId))
        .unwrap()
        .then((data) => {
          setPurchaseOrder(data)
        })
        .finally(() => setLoading(false))
    }
  }, [open, purchaseOrderId, dispatch])

  const itemsCount = purchaseOrder?.items?.length || 0

  if (!open) return null

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await dispatch(generateWarehouseReceiptFromPO(purchaseOrderId)).unwrap()
      onConfirm?.()
      onOpenChange(false)
    } catch (error) {
      // Error handled by thunk/toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-3xl", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xác nhận tạo phiếu nhập kho</DialogTitle>
          <DialogDescription>
            Tạo phiếu nhập kho từ đơn mua hàng này. Tất cả sản phẩm sẽ được nhập vào kho.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Purchase Order Info */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Nhà cung cấp:</span>
                <div className="font-medium">{purchaseOrder?.supplier?.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <div className="font-medium">{purchaseOrder?.code}</div>
              </div>
            </div>
          </div>

          {/* Products to import */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Sản phẩm sẽ nhập kho:</h4>
              <span className="text-sm text-muted-foreground">
                Tổng số: {itemsCount} sản phẩm
              </span>
            </div>
            <div className="max-h-[400px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrder?.items?.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.productName}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.unitName || item.unit?.name || '—'}</TableCell>
                      <TableCell className="text-right">
                        {Number(item.unitPrice).toLocaleString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!purchaseOrder?.items || purchaseOrder?.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        Không có sản phẩm nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Warning for existing receipts */}
          {(purchaseOrder?.warehouseReceiptId || (purchaseOrder?.warehouseReceipts && purchaseOrder.warehouseReceipts.length > 0)) && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
              <p className="font-medium flex items-center">
                <InfoCircledIcon className="mr-2 h-4 w-4" />
                Đơn hàng này đã có phiếu nhập kho!
              </p>
              <p className="mt-1 text-xs ml-6">
                Vui lòng kiểm tra kỹ để tránh nhập trùng.
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <p className="font-medium">⚠️ Lưu ý:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>
                Phiếu nhập kho sẽ được tạo ở trạng thái <strong>Nháp</strong> với toàn bộ sản phẩm.
              </li>
              <li>
                Tồn kho chưa được cộng cho đến khi <strong>Ghi sổ kho</strong>.
              </li>
              <li>Bạn có thể xem và chỉnh sửa phiếu kho sau khi tạo.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || itemsCount === 0}
            loading={loading}
          >
            <IconPackageImport className="mr-2 h-4 w-4" />
            Tạo phiếu nhập kho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmImportWarehouseDialog
