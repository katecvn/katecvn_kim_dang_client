
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
import { exportPurchaseBacklogToExcel } from '@/utils/export-purchase-backlog'
import { moneyFormat } from '@/utils/money-format'
import { IconDownload } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { format } from 'date-fns'

const ExportPurchaseBacklogPreviewDialog = ({
  open,
  onOpenChange,
  data,
  contentClassName,
  overlayClassName,
}) => {
  const flattenedData = useMemo(() => {
    const list = []
    if (data && data.length > 0) {
      data.forEach(record => {
        // Case 1: Direct items
        if (record.items && record.items.length > 0) {
          record.items.forEach(item => {
            const total = Number(item.totalAmount) || 0
            const receivedQty = Number(item.receivedQuantity) || 0
            const orderedQty = Number(item.quantity) || 0
            const unitPrice = Number(item.unitPrice) || 0

            const paid = receivedQty * unitPrice
            const remaining = (orderedQty - receivedQty) * unitPrice

            list.push({
              ...item,
              orderCode: record.code,
              supplierName: record.supplierName,
              supplierPhone: record.supplierPhone,
              deliveryDate: item.expectedDeliveryDate,
              itemTotal: total,
              itemPaid: paid,
              itemRemaining: remaining
            })
          })
        }
        // Case 2: Nested purchaseOrders
        else if (record.purchaseOrders && record.purchaseOrders.length > 0) {
          record.purchaseOrders.forEach(order => {
            if (order.items && order.items.length > 0) {
              order.items.forEach(item => {
                const total = Number(item.totalAmount) || 0
                const receivedQty = Number(item.receivedQuantity) || 0
                const orderedQty = Number(item.quantity) || 0
                const unitPrice = Number(item.unitPrice) || 0

                const paid = receivedQty * unitPrice
                const remaining = (orderedQty - receivedQty) * unitPrice

                list.push({
                  ...item,
                  orderCode: order.code,
                  supplierName: record.supplierName,
                  supplierPhone: record.supplierPhone,
                  deliveryDate: item.expectedDeliveryDate,
                  itemTotal: total,
                  itemPaid: paid,
                  itemRemaining: remaining
                })
              })
            }
          })
        }
      })
    }
    return list
  }, [data])

  const totals = useMemo(() => {
    return flattenedData.reduce((acc, item) => {
      return {
        itemTotal: acc.itemTotal + (item.itemTotal || 0),
        itemPaid: acc.itemPaid + (item.itemPaid || 0),
        itemRemaining: acc.itemRemaining + (item.itemRemaining || 0),
      }
    }, {
      itemTotal: 0,
      itemPaid: 0,
      itemRemaining: 0,
    })
  }, [flattenedData])

  const handleExport = () => {
    if (data) {
      exportPurchaseBacklogToExcel(data)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("md:max-w-[95vw] max-h-[90vh] flex flex-col", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xem trước danh sách đơn mua chưa nhận</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table className="relative w-full">
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                <TableHead className="w-[50px] border-r">STT</TableHead>
                <TableHead className="min-w-[100px] border-r">Mã ĐH</TableHead>
                <TableHead className="min-w-[150px] border-r">Nhà cung cấp</TableHead>
                <TableHead className="min-w-[150px] border-r">Sản phẩm</TableHead>
                <TableHead className="text-center border-r">SL Đặt</TableHead>
                <TableHead className="text-center border-r">SL Nhận</TableHead>
                <TableHead className="text-center border-r">Ngày hẹn</TableHead>
                <TableHead className="text-right border-r">Tổng tiền</TableHead>
                <TableHead className="text-right border-r">Đã trả</TableHead>
                <TableHead className="text-right">Còn lại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Total Row */}
              <TableRow className="font-bold bg-muted/50 text-red-600 sticky top-[calc(theme(spacing.10))] z-10 shadow-sm">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r text-center">Cộng</TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r text-right">{moneyFormat(totals.itemTotal)}</TableCell>
                <TableCell className="border-r text-right">{moneyFormat(totals.itemPaid)}</TableCell>
                <TableCell className="text-right">{moneyFormat(totals.itemRemaining)}</TableCell>
              </TableRow>

              {flattenedData.map((item, index) => {
                const dateStr = item.deliveryDate
                  ? format(new Date(item.deliveryDate), 'dd/MM/yyyy')
                  : '-'

                return (
                  <TableRow key={index}>
                    <TableCell className="border-r text-center">{index + 1}</TableCell>
                    <TableCell className="border-r font-medium text-primary">{item.orderCode}</TableCell>
                    <TableCell className="border-r">
                      <div className="font-semibold">{item.supplierName}</div>
                      <div className="text-xs text-muted-foreground">{item.supplierPhone}</div>
                    </TableCell>
                    <TableCell className="border-r">{item.productName}</TableCell>
                    <TableCell className="border-r text-center">{Number(item.quantity) || 0}</TableCell>
                    <TableCell className="border-r text-center">{Number(item.receivedQuantity) || 0}</TableCell>
                    <TableCell className="border-r text-center">{dateStr}</TableCell>
                    <TableCell className="border-r text-right">{moneyFormat(item.itemTotal)}</TableCell>
                    <TableCell className="border-r text-right text-green-600">{moneyFormat(item.itemPaid)}</TableCell>
                    <TableCell className="text-right text-red-600">{moneyFormat(item.itemRemaining)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex gap-2">
          <div className="flex-1 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white">
              <IconDownload className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportPurchaseBacklogPreviewDialog
