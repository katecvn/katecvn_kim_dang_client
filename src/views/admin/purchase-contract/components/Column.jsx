import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { normalizeText } from '@/utils/normalize-text'
import { Checkbox } from '@/components/ui/checkbox'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { paymentStatuses, purchaseOrderStatuses } from '../data'
import { useState } from 'react'
import Can from '@/utils/can'
import ViewPurchaseContractDialog from './ViewPurchaseContractDialog'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Phone, FileText, CheckCircle, XCircle, PackageOpen } from 'lucide-react'

export const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="mx-2 translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="mx-2 translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'code',
    accessorFn: (row) => normalizeText(row.code || ''),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số HĐ" />
    ),
    cell: function Cell({ row }) {
      const [showViewDialog, setShowViewDialog] = useState(false)

      return (
        <>
          <Can permission={'GET_PURCHASE_CONTRACT'}>
            {showViewDialog && (
              <ViewPurchaseContractDialog
                open={showViewDialog}
                onOpenChange={setShowViewDialog}
                contractId={row.original.id}
                showTrigger={false}
              />
            )}
          </Can>

          <span
            className="cursor-pointer font-medium text-primary hover:underline hover:text-blue-600"
            onClick={() => setShowViewDialog(true)}
          >
            {row.original.code}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhà cung cấp" />
    ),
    cell: function Cell({ row }) {
      return (
        <div className="flex w-40 flex-col break-words" title={row.original.supplierName}>
          <span className="font-semibold">{row.original.supplierName}</span>

          {row.original.supplierIdentityNo && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              {row.original.supplierIdentityNo}
            </span>
          )}

          {(row.original.supplierTaxCode || row.original.supplier?.taxCode) && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              MST: {row.original.supplierTaxCode || row.original.supplier?.taxCode}
            </span>
          )}

          <span className="text-primary underline hover:text-secondary-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <a href={`tel:${row.original.supplierPhone}`}>{row.original.supplierPhone}</a>
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const searchableText = normalizeText(
        `${row.original.supplierName || ''} ${row.original.supplierPhone || ''}`,
      )
      const searchValue = normalizeText(value)
      return searchableText.includes(searchValue)
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-semibold">
            {moneyFormat(row.original.totalAmount)}
          </span>
          {row.original.paidAmount > 0 && (
            <span className="text-xs text-green-600">
              Đã trả: {moneyFormat(row.original.paidAmount)}
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'contractDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày ký" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{dateFormat(row.original.contractDate)}</span>
          {row.original.purchaseOrders?.[0]?.expectedDeliveryDate && (
            <span className="text-xs text-muted-foreground">
              Giao: {dateFormat(row.original.purchaseOrders?.[0]?.expectedDeliveryDate)}
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const status = purchaseOrderStatuses.find((s) => s.value === row.original.status)

      if (!status) return null

      const Icon = status.icon

      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${status.color}`} />
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'warehouseStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái nhập" />
    ),
    cell: ({ row }) => {
      // Assuming structure similar to Sales: purchaseOrders -> warehouseReceipts
      const warehouseReceipt = row.original.warehouseReceipts?.[0] || row.original.purchaseOrders?.[0]?.warehouseReceipts?.[0]

      let Icon = PackageOpen
      let label = 'Chưa nhập'
      let colorClass = 'text-gray-400'

      if (warehouseReceipt) {
        if (warehouseReceipt.status === 'draft') {
          Icon = FileText
          label = 'Nháp'
          colorClass = 'text-yellow-600'
        } else if (warehouseReceipt.status === 'posted') {
          Icon = CheckCircle
          label = 'Đã ghi sổ'
          colorClass = 'text-green-600'
        } else if (warehouseReceipt.status === 'cancelled') {
          Icon = XCircle
          label = 'Đã hủy'
          colorClass = 'text-red-600'
        } else {
          Icon = PackageOpen
          label = warehouseReceipt.status
          colorClass = 'text-gray-500'
        }
      }

      return (
        <Badge
          variant="outline"
          className={`cursor-default select-none ${colorClass}`}
          title={
            warehouseReceipt
              ? `Mã: ${warehouseReceipt.code}`
              : 'Chưa có phiếu nhập kho'
          }
        >
          <Icon className="mr-1 h-3 w-3" />
          {label}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'purchaseOrders',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thanh toán" />
    ),
    cell: ({ row }) => {
      // Get paymentStatus from first po
      const firstPO = row.original.purchaseOrders?.[0]
      if (!firstPO) {
        return <span className="text-muted-foreground text-sm">—</span>
      }

      const paymentStatus = paymentStatuses.find(
        (s) => s.value === firstPO.paymentStatus,
      )

      if (!paymentStatus) return <span className="text-sm">—</span>

      const Icon = paymentStatus.icon

      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${paymentStatus.color}`} />
          <span className="text-sm">{paymentStatus.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      // Filter by PO paymentStatus
      const firstPO = row.original.purchaseOrders?.[0]
      if (!firstPO) return false
      return value.includes(firstPO.paymentStatus)
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
