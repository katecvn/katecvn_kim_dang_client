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
import { IconPackageExport } from '@tabler/icons-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const ConfirmWarehouseReceiptDialog = ({
  open,
  onOpenChange,
  invoice,
  onConfirm,
  loading = false,
  type = 'retail', // 'retail' | 'contract'
  contentClassName,
  overlayClassName,
}) => {
  const [selectedItems, setSelectedItems] = useState({})

  // Helper to check if item is selectable
  const isItemSelectable = (item) => {
    if (type === 'contract') {
      // In contract mode, we WANT to select contract items
      // We essentially select EVERYTHING in the invoice because the invoice is linked to the contract
      return true
    }
    // In retail mode, only select items NOT in a contract
    return !item.salesContractItemId
  }

  useEffect(() => {
    if (invoice?.invoiceItems) {
      const initialSelection = {}
      invoice.invoiceItems.forEach((item) => {
        if (isItemSelectable(item)) {
          initialSelection[item.id] = true
        }
      })
      setSelectedItems(initialSelection)
    }
  }, [invoice, type])

  if (!invoice) return null

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
    invoice.invoiceItems.forEach((item) => {
      if (isItemSelectable(item)) {
        newSelection[item.id] = checked
      }
    })
    setSelectedItems(newSelection)
  }

  const validItemsCount = invoice.invoiceItems?.filter(isItemSelectable).length

  const selectedCount = Object.values(selectedItems).filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-3xl", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xác nhận tạo phiếu xuất kho</DialogTitle>
          <DialogDescription>
            Chọn sản phẩm cần xuất kho từ hóa đơn này
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

          {/* Warning for existing receipts */}
          {(invoice.warehouseReceiptId || (invoice.warehouseReceipts && invoice.warehouseReceipts.length > 0)) && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
              <p className="font-medium flex items-center">
                <InfoCircledIcon className="mr-2 h-4 w-4" />
                Đơn hàng này đã có phiếu xuất kho!
              </p>
              <p className="mt-1 text-xs ml-6">
                Vui lòng kiểm tra kỹ các sản phẩm để tránh xuất trùng.
              </p>
            </div>
          )}

          {/* Products to export */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Sản phẩm sẽ xuất kho:</h4>
              <span className="text-sm text-muted-foreground">
                Đã chọn: {selectedCount}/{validItemsCount}
              </span>
            </div>
            <div className="max-h-[400px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedCount === validItemsCount &&
                          validItemsCount > 0
                        }
                        onCheckedChange={toggleAll}
                        disabled={validItemsCount === 0}
                      />
                    </TableHead>
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.invoiceItems?.map((item, index) => {
                    const selectable = isItemSelectable(item)
                    const isContractItem = !!item.salesContractItemId

                    // If not selectable (Retail mode + Contract Item), show disabled/tooltip
                    // If selectable, show checkbox and normal status

                    return (
                      <TableRow
                        key={item.id}
                        className={!selectable ? 'bg-muted/30' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={!!selectedItems[item.id]}
                            onCheckedChange={() => toggleItem(item.id)}
                            disabled={!selectable}
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.productName}</div>
                          {isContractItem && type === 'retail' && (
                            <span className="text-xs text-orange-600">
                              (Thuộc hợp đồng)
                            </span>
                          )}
                          {isContractItem && type === 'contract' && (
                            <span className="text-xs text-blue-600">
                              (Theo hợp đồng)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          {item.quantity}
                        </TableCell>
                        <TableCell>{item.unitName || 'N/A'}</TableCell>
                        <TableCell>
                          {!selectable ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <InfoCircledIcon className="h-3 w-3" />
                                    Không thể xuất
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Sản phẩm này nằm trong hợp đồng <br /> không
                                    thể xuất tại đây
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-xs text-green-600">
                              Có thể xuất
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Warning for existing receipts */}
          {(invoice.warehouseReceiptId || (invoice.warehouseReceipts && invoice.warehouseReceipts.length > 0)) && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
              <p className="font-medium flex items-center">
                <InfoCircledIcon className="mr-2 h-4 w-4" />
                Đơn hàng này đã có phiếu xuất kho!
              </p>
              <p className="mt-1 text-xs ml-6">
                Vui lòng kiểm tra kỹ các sản phẩm để tránh xuất trùng.
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <p className="font-medium">⚠️ Lưu ý:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>
                Phiếu xuất kho sẽ được tạo ở trạng thái <strong>Nháp</strong>
              </li>
              <li>
                Tồn kho chưa bị trừ cho đến khi <strong>Ghi sổ kho</strong>
              </li>
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
            disabled={loading || selectedCount === 0}
            loading={loading}
          >
            <IconPackageExport className="mr-2 h-4 w-4" />
            Tạo phiếu xuất kho ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmWarehouseReceiptDialog