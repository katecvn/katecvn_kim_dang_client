import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical, Eye, Printer, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { warehouseReceiptStatuses, receiptTypes } from '../data'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import ViewWarehouseReceiptDialog from './ViewWarehouseReceiptDialog'
import PrintWarehouseReceiptView from './PrintWarehouseReceiptView'
import { DeleteWarehouseReceiptDialog } from './DeleteWarehouseReceiptDialog'
import { UpdateWarehouseReceiptStatusDialog } from './UpdateWarehouseReceiptStatusDialog'
import { updateWarehouseReceipt, getWarehouseReceipts, cancelWarehouseReceipt, postWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'

const MobileWarehouseReceiptCard = ({
  receipt,
  isSelected,
  onSelectChange,
}) => {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Print state
  const setting = useSelector((state) => state.setting.setting)
  const [printData, setPrintData] = useState(null)

  const { code, receiptDate, totalAmount, status, note, supplier, customer, receiptType, invoice } = receipt

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
      // Refresh list handled by parent or slice if needed, but usually we should refresh
      dispatch(getWarehouseReceipts())
    } catch (error) {
      console.error(error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const handlePrintReceipt = () => {
    setPrintData(receipt)
    setTimeout(() => setPrintData(null), 100)
  }

  const getStatusBadge = (statusValue) => {
    const statusObj = warehouseReceiptStatuses.find((s) => s.value === statusValue)
    // Fallback colors if not defined in data
    const colorClass = statusObj?.color || 'bg-gray-500'

    return (
      <Badge
        className={`cursor-pointer hover:underline ${colorClass}`}
        onClick={() => setShowUpdateStatusDialog(true)}
      >
        {statusObj?.label || statusValue}
      </Badge>
    )
  }

  const partnerName = receiptType === 1 ? supplier?.name : customer?.name
  const partnerLabel = receiptType === 1 ? 'Nhà cung cấp' : 'Khách hàng'

  return (
    <>
      {showViewDialog && (
        <ViewWarehouseReceiptDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          receiptId={receipt.id}
          showTrigger={false}
        />
      )}

      {showUpdateStatusDialog && (
        <UpdateWarehouseReceiptStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          receiptId={receipt.id}
          receiptCode={code}
          currentStatus={status}
          statuses={warehouseReceiptStatuses}
          onSubmit={handleUpdateStatus}
          contentClassName="z-[10002]"
          overlayClassName="z-[10001]"
        />
      )}

      {showDeleteDialog && (
        <DeleteWarehouseReceiptDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          receipt={receipt}
          showTrigger={false}
        />
      )}

      {/* Print View */}
      {printData && (
        <PrintWarehouseReceiptView
          receipt={printData}
          setting={setting}
        />
      )}

      <div className="border rounded-lg bg-card mb-3 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b bg-background/50 flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectChange}
            className="h-4 w-4"
          />

          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm truncate text-primary cursor-pointer hover:underline"
              onClick={() => setShowViewDialog(true)}
            >
              <div className="flex items-center gap-2">
                <span>{code}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{dateFormat(receiptDate, true)}</div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handlePrintReceipt}>
                <Printer className="mr-2 h-4 w-4" />
                In phiếu
              </DropdownMenuItem>

              {status === 'draft' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Amount & Status Section */}
        <div className="p-3 border-b bg-background/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Tổng tiền:</span>
            <span className="text-sm font-semibold text-primary">{moneyFormat(totalAmount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Trạng thái:</span>
            {getStatusBadge(status)}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 border-b bg-background/30 space-y-1.5">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{partnerLabel}:</span>
            <span className="text-xs text-right font-medium line-clamp-1">{partnerName || '---'}</span>
          </div>
          {invoice && (
            <div className="flex justify-between items-start">
              <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Hóa đơn:</span>
              <span className="text-xs text-right font-medium text-primary">{invoice.code}</span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="p-3 bg-muted/30 space-y-2 border-t text-xs">
            {note && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span className="italic">{note}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Loại phiếu:</span>
              <span>{receiptTypes.find(t => t.value === receiptType)?.label}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MobileWarehouseReceiptCard
