import { statuses } from '../data'
import { Badge } from '@/components/ui/badge'
import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { normalizeText } from '@/utils/normalize-text'

export const columns = [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã nhân viên" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Họ và tên" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {row.getValue('fullName')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    filterFn: (row, id, value) => {
      const fullName = normalizeText(row.original.fullName)
      const searchValue = normalizeText(value)

      return fullName.includes(searchValue)
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const statusValue = row.getValue('status')
      const status = statuses.find((status) => status.value === statusValue)

      return (
        <div className="flex w-[110px] items-center">
          <span>
            <Badge variant={status.value === 'blocked' ? 'destructive' : ''}>
              {status.icon && <status.icon className="mr-2 h-4 w-4" />}
              {status.label}
            </Badge>
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },

    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số điện thoại" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          {row.getValue('phone') ? (
            <a
              href={`tel:${row.getValue('phone')}`}
              className="text-primary underline dark:text-secondary-foreground"
            >
              {row.getValue('phone')}
            </a>
          ) : (
            'Không có'
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
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
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
