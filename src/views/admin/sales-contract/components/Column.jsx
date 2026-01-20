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
    id: 'contractNumber',
    accessorFn: (row) => normalizeText(row.contractNumber || ''),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số HĐ" />
    ),
    cell: function Cell({ row }) {
      const [showViewDialog, setShowViewDialog] = useState(false)

      return (
        <>
          <Can permission={'VIEW_SALES_CONTRACT'}>
            {showViewDialog && (
              <ViewSalesContractDialog
                open={showViewDialog}
                onOpenChange={setShowViewDialog}
                contractId={row.original.id}
                showTrigger={false}
              />
            )}
          </Can>

          <span
            className="cursor-pointer hover:text-primary"
            onClick={() => setShowViewDialog(true)}
          >
            {row.original.contractNumber}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: function Cell({ row }) {
      const { customer } = row.original

      return (
        <div className="flex w-40 flex-col break-words" title={customer?.name}>
          <span className="font-semibold">{customer?.name}</span>

          {customer?.idCard && (
            <span className="text-xs text-muted-foreground">
              CCCD: {customer.idCard}
            </span>
          )}

          <span className="text-primary underline hover:text-secondary-foreground">
            <a href={`tel:${customer?.phone}`}>{customer?.phone}</a>
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const customer = row.original.customer
      const searchableText = normalizeText(
        `${customer?.name || ''} ${customer?.phone || ''}`,
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
              Đã thu: {moneyFormat(row.original.paidAmount)}
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
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thanh toán" />
    ),
    cell: ({ row }) => {
      const paymentStatus = paymentStatuses.find(
        (s) => s.value === row.original.paymentStatus,
      )

      if (!paymentStatus) return null

      const Icon = paymentStatus.icon

      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${paymentStatus.color}`} />
          <span>{paymentStatus.label}</span>
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
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
