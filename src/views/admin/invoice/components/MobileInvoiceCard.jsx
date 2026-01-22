import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableRowActions } from './DataTableRowAction'

const MobileInvoiceCard = ({
  invoice,
  isSelected,
  onSelectChange,
  onRowAction,
}) => {
  const [expanded, setExpanded] = useState(false)
  const { customer, amount, discount, taxAmount, status, code, createdAt } = invoice

  const getStatusBadge = (statusValue) => {
    const statusMap = {
      pending: { label: 'Chờ xử lý', variant: 'default' },
      approved: { label: 'Đã duyệt', variant: 'secondary' },
      completed: { label: 'Hoàn tất', variant: 'outline' },
      cancelled: { label: 'Hủy', variant: 'destructive' },
    }
    const config = statusMap[statusValue] || { label: statusValue, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getDebtStatus = (row) => {
    const receipts = row?.receipts || []
    const debt = receipts.length > 0 ? receipts[0]?.debt : null

    if (!debt) {
      return <span className="text-xs text-muted-foreground">Chưa có phiếu thu</span>
    }

    if (debt.status === 'closed') {
      return <span className="text-xs text-green-500 font-medium">✓ Thanh toán toàn bộ</span>
    }

    const remainingAmount = moneyFormat(debt.remainingAmount)

    if (debt.paidAmount === 0) {
      return <span className="text-xs text-red-500 font-medium">Còn nợ: {remainingAmount}</span>
    }

    return <span className="text-xs text-yellow-600 font-medium">Còn nợ: {remainingAmount}</span>
  }

  const isDuplicate = invoice?.creditNotes?.length > 0

  return (
    <div className="border rounded-lg bg-card mb-3 overflow-hidden">
      {/* Header - Always Visible */}
      <div className="p-3 border-b bg-background/50 flex items-center gap-2">
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectChange}
          className="h-4 w-4"
        />

        {/* Code & Date */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{code}</div>
          <div className="text-xs text-muted-foreground">{dateFormat(createdAt)}</div>
        </div>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DataTableRowActions row={{ original: invoice }} />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
        </Button>
      </div>

      {/* Customer Section */}
      <div className="p-3 border-b bg-background/30 space-y-1.5">
        <div className={cn(isDuplicate && 'bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded')}>
          <div className="text-sm font-medium truncate">{customer?.name}</div>
          <div className="text-xs text-muted-foreground">{customer?.phone}</div>
          {customer?.taxCode && (
            <div className="text-xs text-muted-foreground">MST: {customer?.taxCode}</div>
          )}
          {isDuplicate && (
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              ⚠ {invoice?.creditNotes?.length} HĐ điều chỉnh
            </div>
          )}
        </div>
      </div>

      {/* Amount Section */}
      <div className="p-3 border-b bg-background/30 space-y-1">
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-foreground">Tổng tiền:</span>
          <span className="text-sm font-semibold text-primary">{moneyFormat(amount)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">Giảm giá:</span>
            <span className="text-xs text-red-500">-{moneyFormat(discount)}</span>
          </div>
        )}
      </div>

      {/* Status & Debt Section */}
      <div className="p-3 border-b bg-background/30 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Trạng thái:</span>
          {getStatusBadge(status)}
        </div>
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-foreground">Công nợ:</span>
          <div>{getDebtStatus(invoice)}</div>
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="p-3 bg-muted/30 space-y-2 border-t">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Thuế:</span>
            <span className="font-medium">{moneyFormat(taxAmount)}</span>
          </div>

          {invoice?.invoiceRevenueShare && (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Chia doanh số:</span>
                <span className="font-medium">{invoice?.invoiceRevenueShare?.user?.fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Số tiền chia:</span>
                <span className="font-medium text-green-600">
                  {moneyFormat(invoice?.invoiceRevenueShare?.amount || 0)}
                </span>
              </div>
            </>
          )}

          {invoice?.note && (
            <div className="flex justify-between text-xs pt-2 border-t">
              <span className="text-muted-foreground">Ghi chú:</span>
              <a
                href={invoice.note}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline truncate"
              >
                Xem
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MobileInvoiceCard
