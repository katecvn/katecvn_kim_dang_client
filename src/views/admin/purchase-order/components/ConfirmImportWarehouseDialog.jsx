import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { IconPackageImport } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const ConfirmImportWarehouseDialog = ({
  open,
  onOpenChange,
  purchaseOrder,
  onConfirm,
  loading = false,
  contentClassName,
  overlayClassName,
}) => {
  const [selectedItems, setSelectedItems] = useState({})

  useEffect(() => {
    if (purchaseOrder?.items) {
      const initialSelection = {}
      purchaseOrder.items.forEach((item) => {
        initialSelection[item.id] = true
      })
      setSelectedItems(initialSelection)
    }
  }, [purchaseOrder])

  if (!purchaseOrder) return null

  const handleConfirm = async () => {
    const selectedIds = Object.keys(selectedItems).filter(
      (id) => selectedItems[id],
    )
    await onConfirm?.(selectedIds)
    onOpenChange(false)
  }

  const toggleItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const toggleAll = (checked) => {
    const newSelection = {}
    purchaseOrder.items.forEach((item) => {
      newSelection[item.id] = checked
    })
    setSelectedItems(newSelection)
  }

  const itemsCount = purchaseOrder.items?.length || 0
  const selectedCount = Object.values(selectedItems).filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-3xl", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xác nhận tạo phiếu nhập kho</DialogTitle>
          <DialogDescription>
            Chọn sản phẩm cần nhập kho từ đơn mua hàng này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Nhà cung cấp:</span>
                <div className="font-medium">{purchaseOrder.supplier?.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <div className="font-medium">{purchaseOrder.code}</div>
              </div>
            </div>
          </div>

          {/* Products to export */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Sản phẩm sẽ nhập kho:</h4>
              <span className="text-sm text-muted-foreground">
                Đã chọn: {selectedCount}/{itemsCount}
              </span>
            </div>
            <div className="max-h-[400px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedCount === itemsCount &&
                          itemsCount > 0
                        }
                        onCheckedChange={toggleAll}
                        disabled={itemsCount === 0}
                      />
                    </TableHead>
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead>Đơn giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrder.items?.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={!!selectedItems[item.id]}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.productName}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(item.unitPrice).toLocaleString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!purchaseOrder.items || purchaseOrder.items.length === 0) && (
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

          {/* Warning */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <p className="font-medium">ℹ️ Lưu ý:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>
                Phiếu nhập kho sẽ được tạo ở trạng thái <strong>Nháp</strong>
              </li>
              <li>
                Tồn kho chưa được cộng cho đến khi <strong>Ghi sổ kho</strong>
              </li>
              <li>Bạn có thể chỉnh sửa phiếu kho sau khi tạo</li>
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
            disabled={loading || selectedCount === 0}
            loading={loading}
          >
            <IconPackageImport className="mr-2 h-4 w-4" />
            Tạo phiếu nhập kho ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmImportWarehouseDialog
