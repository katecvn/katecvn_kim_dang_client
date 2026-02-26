import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { normalizeText } from '@/utils/normalize-text'
import { Checkbox } from '@/components/ui/checkbox'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { statuses, paymentStatuses } from '../data'
import { useState } from 'react'
import Can from '@/utils/can'
import ViewSalesContractDialog from './ViewSalesContractDialog'
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
    cell: function Cell({ row, table }) {
      const handleView = () => {
        if (table?.options?.meta?.onView) {
          table.options.meta.onView(row.original.id)
        }
      }

      return (
        <span
          className="cursor-pointer font-medium text-primary hover:underline hover:text-blue-600"
          onClick={handleView}
        >
          {row.original.code}
        </span>
      )
    },
  },
  {
    accessorKey: 'buyerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: function Cell({ row, table }) {
      const { buyerName, buyerPhone, buyerIdentityNo, buyerTaxCode, contractDate, id } = row.original
      const rows = table.getPrePaginationRowModel().rows.map((r) => r.original)

      const isDuplicate = rows.some(
        (r) =>
          r.buyerPhone === buyerPhone &&
          new Date(r.contractDate).getMonth() === new Date(contractDate).getMonth() &&
          new Date(r.contractDate).getFullYear() ===
          new Date(contractDate).getFullYear() &&
          r.id !== id,
      )

      return (
        <div
          className={`flex w-40 flex-col break-words ${isDuplicate ? 'bg-yellow-200 p-2' : ''
            }`}
          title={buyerName}
        >
          <span className="font-semibold">{buyerName}</span>

          {buyerIdentityNo && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              {buyerIdentityNo}
            </span>
          )}

          {(buyerTaxCode || row.original.customer?.taxCode) && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              MST: {buyerTaxCode || row.original.customer?.taxCode}
            </span>
          )}

          <span className="text-primary underline hover:text-secondary-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <a href={`tel:${buyerPhone}`}>{buyerPhone}</a>
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const searchableText = normalizeText(
        `${row.original.buyerName || ''} ${row.original.buyerPhone || ''}`,
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
          {/* {row.original.paidAmount > 0 && (
            <span className="text-xs text-green-600">
              Đã thu: {moneyFormat(row.original.paidAmount)}
            </span>
          )} */}
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
          {row.original.deliveryDate && (
            <span className="text-xs text-muted-foreground">
              Giao: {dateFormat(row.original.deliveryDate)}
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
      const status = statuses.find((s) => s.value === row.original.status)

      if (!status) return null

      const Icon = status.icon

      return (
        <Badge
          variant="outline"
          className={`cursor-default select-none border-transparent bg-transparent px-0 ${status.color}`}
        >
          <Icon className="mr-1.5 h-3.5 w-3.5" />
          {status.label}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'warehouseReceiptStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái xuất" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('warehouseReceiptStatus') || 'none'

      let Icon = PackageOpen
      let label = 'Chưa xuất'
      let colorClass = 'text-gray-400'

      if (status === 'draft') {
        Icon = FileText
        label = 'Đã tạo nháp'
        colorClass = 'text-yellow-600'
      } else if (status === 'posted_partial') {
        Icon = CheckCircle
        label = 'Xuất một phần'
        colorClass = 'text-blue-600'
      } else if (status === 'posted_full') {
        Icon = CheckCircle
        label = 'Đã xuất đủ'
        colorClass = 'text-green-600'
      } else if (status === 'none') {
        Icon = PackageOpen
        label = 'Chưa xuất'
        colorClass = 'text-gray-400'
      } else if (status) {
        // Fallback for other potential statuses
        label = status
        colorClass = 'text-gray-500'
      }

      return (
        <Badge
          variant="outline"
          className={`cursor-default select-none border-transparent bg-transparent px-0 ${colorClass}`}
        >
          <Icon className="mr-1.5 h-3.5 w-3.5" />
          {label}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'paymentStatus', // Change accessorKey: 'invoices' to id: 'paymentStatus'
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thanh toán" />
    ),
    cell: ({ row }) => {
      const pStatus = row.original.paymentStatus || 'none'

      const paymentStatus = paymentStatuses.find(
        (s) => s.value === pStatus,
      )

      if (!paymentStatus) return <span className="text-sm">—</span>

      const Icon = paymentStatus.icon

      return (
        <Badge
          variant="outline"
          className={`cursor-default select-none border-transparent bg-transparent px-0 ${paymentStatus.color}`}
        >
          <Icon className="mr-1.5 h-3.5 w-3.5" />
          {paymentStatus.label}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
    accessorFn: (row) => row.paymentStatus || null,
  },
  {
    id: 'user', // Add Creator column
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => {
      const user = row.original.createdByUser
      return (
        <div className="flex w-32 flex-col">
          <span className="truncate font-medium" title={user?.fullName}>
            {user?.fullName || '—'}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {dateFormat(row.original.createdAt, true)}
          </span>
        </div>
      )
    },
    accessorFn: (row) => row.createdByUser?.id || null, // For server-side filtering matching
    enableSorting: true,
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
