import { useState } from 'react'
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
import { IconPackageExport } from '@tabler/icons-react'

const ConfirmWarehouseReceiptDialog = ({
  open,
  onOpenChange,
  invoice,
  onConfirm,
  loading = false,
}) => {
  if (!invoice) return null

  const handleConfirm = async () => {
    await onConfirm?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPackageExport className="h-5 w-5 text-blue-600" />
            Xác nhận tạo phiếu xuất kho
          </DialogTitle>
          <DialogDescription>
            Phiếu xuất kho sẽ được tạo tự động từ hóa đơn{' '}
            <span className="font-semibold text-primary">{invoice.code}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Info */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Khách hàng:</span>
                <div className="font-medium">{invoice.customer?.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mã hóa đơn:</span>
                <div className="font-medium">{invoice.code}</div>
              </div>
            </div>
          </div>

          {/* Products to export */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">
              Sản phẩm sẽ xuất kho:
            </h4>
            <div className="max-h-[300px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead>Đơn vị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.invoiceItems?.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.unitName || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <p className="font-medium">⚠️ Lưu ý:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>Phiếu xuất kho sẽ được tạo ở trạng thái <strong>Nháp</strong></li>
              <li>Tồn kho chưa bị trừ cho đến khi <strong>Ghi sổ kho</strong></li>
              <li>Bạn có thể xem và chỉnh sửa phiếu kho sau khi tạo</li>
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
            disabled={loading}
            loading={loading}
          >
            <IconPackageExport className="mr-2 h-4 w-4" />
            Tạo phiếu xuất kho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmWarehouseReceiptDialog
