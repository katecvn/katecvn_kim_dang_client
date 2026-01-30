import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã HĐ" />
    ),
    cell: ({ row, table }) => {
      // Placeholder for view dialog interaction
      return (
        <div
          className={cn("w-28 font-medium cursor-pointer hover:underline text-primary")}
          onClick={() => table.options.meta?.onView?.(row.original.id)}
        >
          {row.getValue('code')}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'supplierName', // Assuming supplierName for Purchase Contract instead of buyerName
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhà cung cấp" />
    ),
    cell: ({ row }) => (
      <div className="w-40 font-medium truncate" title={row.getValue('supplierName')}>
        {row.getValue('supplierName') || 'N/A'}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'contractDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày ký" />
    ),
    cell: ({ row }) => (
      <div className="w-32">{dateFormat(row.getValue('contractDate'), true)}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng giá trị" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="font-medium text-blue-600">
            {moneyFormat(row.getValue('totalAmount'))}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <div className="w-28">
          <Badge
            className={cn(
              status === 'completed' ? 'bg-green-500' :
                status === 'cancelled' ? 'bg-red-500' :
                  status === 'confirmed' ? 'bg-blue-500' :
                    'bg-yellow-500'
            )}
          >
            {status === 'completed' ? 'Đã giao hàng' :
              status === 'draft' ? 'Chờ xác nhận' :
                status === 'cancelled' ? 'Đã hủy' :
                  status === 'confirmed' ? 'Đang giao hàng' :
                    'Đã thanh lý'}
          </Badge>
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
