import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { useState } from 'react'
import ViewWarehouseReceiptDialog from './ViewWarehouseReceiptDialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { receiptTypes, warehouseReceiptStatuses } from '../data'
import Can from '@/utils/can'

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
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã phiếu" />
    ),
    cell: function Cell({ row }) {
      const [showViewDialog, setShowViewDialog] = useState(false)

      return (
        <>
          <Can permission={'GET_WAREHOUSE_RECEIPT'}>
            {showViewDialog && (
              <ViewWarehouseReceiptDialog
                open={showViewDialog}
                onOpenChange={setShowViewDialog}
                receiptId={row.original.id}
                showTrigger={false}
              />
            )}
          </Can>

          <div
            className="w-32 cursor-pointer text-primary hover:underline"
            onClick={() => setShowViewDialog(true)}
          >
            {row.getValue('code')}
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'partner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đối tác" />
    ),
    cell: ({ row }) => {
      const receiptType = row.original.receiptType
      const supplier = row.original.supplier
      const customer = row.original.customer

      // Nhập kho -> hiển thị supplier
      if (receiptType === 1 && supplier) {
        return (
          <div className="w-48 truncate" title={supplier.name}>
            <span className="font-semibold">{supplier.name}</span>
            <div className="text-xs text-muted-foreground">{supplier.code}</div>
          </div>
        )
      }

      // Xuất kho -> hiển thị customer
      if (receiptType === 2 && customer) {
        return (
          <div className="w-48 truncate" title={customer.name}>
            <span className="font-semibold">{customer.name}</span>
            <div className="text-xs text-muted-foreground">{customer.code}</div>
          </div>
        )
      }

      return <div className="w-48 text-muted-foreground">Không có</div>
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'receiptDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày lập" />
    ),
    cell: ({ row }) => (
      <div className="w-32">{dateFormat(row.getValue('receiptDate'))}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'totalQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng" />
    ),
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue('totalQuantity') || 0)
      return (
        <div className="w-24 text-end">
          {quantity.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {moneyFormat(row.getValue('totalAmount'))}
          </span>
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
      const status = warehouseReceiptStatuses.find(
        (s) => s.value === row.getValue('status'),
      )
      return (
        <div className="w-28">
          <Badge className={status?.color || 'bg-gray-500'}>
            {status?.label || 'Không xác định'}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lý do" />
    ),
    cell: ({ row }) => (
      <div className="w-64 truncate" title={row.getValue('reason')}>
        {row.getValue('reason') || 'Không có'}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('updatedAt'))}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]