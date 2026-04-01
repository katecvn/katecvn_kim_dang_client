import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { normalizeText } from '@/utils/normalize-text'
import { Checkbox } from '@/components/ui/checkbox'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { purchaseContractPaymentStatuses, purchaseContractStatuses } from '../data'
import { useState } from 'react'
import Can from '@/utils/can'
import ViewPurchaseContractDialog from './ViewPurchaseContractDialog'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Phone, FileText, CheckCircle, XCircle, PackageOpen, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhà CC / Khách hàng" />
    ),
    cell: function Cell({ row }) {
      const { supplier, customer } = row.original
      const party = supplier || customer
      const isCustomer = !supplier && !!customer

      // Fallback to flat fields if nested objects not present
      const name = party?.name || row.original.supplierName || row.original.customerName
      const phone = party?.phone || row.original.supplierPhone || row.original.customerPhone
      const taxCode = party?.taxCode || row.original.supplierTaxCode
      const identityCard = party?.identityCard || row.original.supplierIdentityNo

      if (!name) return <span className="text-muted-foreground italic">—</span>

      return (
        <div className="flex w-44 flex-col break-words gap-0.5" title={name}>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'shrink-0 rounded px-1 py-0 text-[10px] font-semibold leading-4',
                isCustomer
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-orange-100 text-orange-700',
              )}
            >
              {isCustomer ? 'KH' : 'NCC'}
            </span>
            <span className="font-semibold truncate">{name}</span>
          </div>

          {!isCustomer && taxCode && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Receipt className="h-3 w-3 shrink-0" />
              {taxCode}
            </span>
          )}

          {isCustomer && identityCard && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CreditCard className="h-3 w-3 shrink-0" />
              {identityCard}
            </span>
          )}

          {phone && (
            <span className="flex items-center gap-1 text-primary underline hover:text-secondary-foreground">
              <Phone className="h-3 w-3" />
              <a href={`tel:${phone}`}>{phone}</a>
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const supplier = row.original.supplier
      const customer = row.original.customer
      const searchableText = normalizeText(
        `${supplier?.name || ''} ${supplier?.taxCode || ''} ${customer?.name || ''} ${row.original.supplierName || ''} ${row.original.supplierPhone || ''}`,
      )
      return searchableText.includes(normalizeText(value))
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      const amount = row.original.totalAmount
      const paidAmount = row.original.paidAmount
      const isLiquidated = row.original.status === 'liquidated'
      const liquidationValue = row.original.liquidationValue

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {isLiquidated && liquidationValue != null && <span className="text-xs font-normal text-muted-foreground mr-1">Ban đầu:</span>}
            {moneyFormat(amount)}
          </span>

          {row.original.paidAmount > 0 && (
            <span className="text-xs text-green-600">
              Đã trả: {moneyFormat(row.original.paidAmount)}
            </span>
          )}

          {isLiquidated && liquidationValue != null && (
            <span className="font-medium text-orange-600">
              <span className="text-xs font-normal mr-1">Bán lại:</span>
              {moneyFormat(liquidationValue)}
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
      const status = purchaseContractStatuses.find((s) => s.value === row.original.status)

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
      <DataTableColumnHeader column={column} title="Trạng thái nhập" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('warehouseReceiptStatus')

      let Icon = PackageOpen
      let label = 'Chưa nhập'
      let colorClass = 'text-gray-400'

      if (status === 'draft') {
        Icon = FileText
        label = 'Đã tạo nháp'
        colorClass = 'text-yellow-600'
      } else if (status === 'posted_partial') {
        Icon = CheckCircle
        label = 'Nhập một phần'
        colorClass = 'text-blue-600'
      } else if (status === 'posted_full') {
        Icon = CheckCircle
        label = 'Đã nhập đủ'
        colorClass = 'text-green-500'
      } else if (status === 'none') {
        Icon = PackageOpen
        label = 'Chưa nhập'
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
    id: 'paymentStatus', // Changed from purchaseOrders
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thanh toán" />
    ),
    cell: ({ row }) => {
      // Get paymentStatus from first po
      const firstPO = row.original.purchaseOrders?.[0]
      if (!firstPO) {
        return <span className="text-muted-foreground text-sm">—</span>
      }

      const paymentStatus = purchaseContractPaymentStatuses.find(
        (s) => s.value === firstPO.paymentStatus,
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
    accessorFn: (row) => row.purchaseOrders?.[0]?.paymentStatus || null,
  },
  {
    id: 'user',
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
            {dateFormat(row.original.createdAt)}
          </span>
        </div>
      )
    },
    accessorFn: (row) => row.createdByUser?.id || null,
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
  {
    id: 'sourceType',
    accessorKey: 'sourceType',
    header: () => null,
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
]
