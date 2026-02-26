import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu'
import { types } from '../data'
import CustomerDetailDialog from './CustomerDetailDialog'
import UpdateCustomerDialog from './UpdateCustomerDialog'
import { DeleteCustomerDialog } from './DeleteCustomerDialog'
import Can from '@/utils/can'

const MobileCustomerCard = ({
  row,
  isSelected,
  onToggleSelect,
}) => {
  const customer = row.original
  const [expanded, setExpanded] = useState(false)

  const [showCustomerDetailDialog, setShowCustomerDetailDialog] = useState(false)
  const [showUpdateCustomerDialog, setShowUpdateCustomerDialog] = useState(false)
  const [showDeleteCustomerDialog, setShowDeleteCustomerDialog] = useState(false)

  const { code, name, phone, creator, invoiceCount, type, createdAt } = customer
  const customerType = types.find((t) => t.value === type)

  return (
    <>
      {showCustomerDetailDialog && (
        <CustomerDetailDialog
          open={showCustomerDetailDialog}
          onOpenChange={setShowCustomerDetailDialog}
          customer={customer}
          showTrigger={false}
        />
      )}

      {showUpdateCustomerDialog && (
        <UpdateCustomerDialog
          open={showUpdateCustomerDialog}
          onOpenChange={setShowUpdateCustomerDialog}
          customer={customer}
          showTrigger={false}
        />
      )}

      {showDeleteCustomerDialog && (
        <DeleteCustomerDialog
          open={showDeleteCustomerDialog}
          onOpenChange={setShowDeleteCustomerDialog}
          customer={customer}
          showTrigger={false}
        />
      )}

      <div className="border rounded-lg bg-card mb-3 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-3 border-b bg-background/50 flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="h-4 w-4"
          />

          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm truncate text-primary cursor-pointer hover:underline"
              onClick={() => setShowCustomerDetailDialog(true)}
            >
              {code}
            </div>
            <div className="text-xs text-muted-foreground">{dateFormat(createdAt)}</div>
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
              <DropdownMenuItem onClick={() => setShowCustomerDetailDialog(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>

              <Can permission="UPDATE_CUSTOMER">
                <DropdownMenuItem
                  onSelect={() => setShowUpdateCustomerDialog(true)}
                  className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Sửa
                </DropdownMenuItem>
              </Can>

              <Can permission="DELETE_CUSTOMER">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setShowDeleteCustomerDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Amount & Status Section -> Name & Types */}
        <div className="p-3 border-b bg-background/30 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs text-muted-foreground shrink-0 mt-0.5">Tên HK:</span>
            <span className="text-sm font-semibold text-right leading-tight">{name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Loại:</span>
            {customerType && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 bg-gray-50 font-medium whitespace-nowrap">
                {customerType.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Info Section -> Phone & Invoices */}
        <div className="p-3 border-b bg-background/30 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Điện thoại:</span>
            {phone ? (
              <a href={`tel:${phone}`} className="text-sm font-medium text-blue-600 hover:underline text-right">
                {phone}
              </a>
            ) : (
              <span className="text-xs text-muted-foreground text-right">—</span>
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Số đơn:</span>
            <span className="text-sm font-medium text-right">{invoiceCount}</span>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="p-3 bg-muted/30 space-y-2 border-t text-xs">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground shrink-0 w-20">Người tạo:</span>
              <span className="font-medium text-right">{creator?.fullName || '—'}</span>
            </div>
            <div className="flex justify-between items-start mt-1">
              <span className="text-muted-foreground shrink-0 w-20">Nhóm:</span>
              <span className="text-right italic">{customer.customerGroup?.name || 'Chưa phân nhóm'}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MobileCustomerCard
