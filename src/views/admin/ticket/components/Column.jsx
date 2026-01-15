import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { Badge } from '@/components/ui/badge'
import { normalizeText } from '@/utils/normalize-text'
import { ticketPriorities, ticketChannels } from '../data'
import TicketStatusCell from './TicketStatusCell'
import TicketSubjectCell from './TicketSubjectCell'

export const columns = [
  {
    accessorKey: 'subject',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu đề" />
    ),
    cell: ({ row }) => <TicketSubjectCell ticket={row.original} />,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const subject = normalizeText(row.original.subject || '')
      const searchValue = normalizeText(value || '')

      return subject.includes(searchValue)
    },
  },
  {
    id: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: ({ row }) => {
      const customer = row.original.customer

      if (!customer) return <span>-</span>

      return (
        <div className="flex w-60 flex-col">
          <span className="font-medium">
            {customer.code ? `${customer.code} - ` : ''}
            {customer.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {customer.phone || customer.email || customer.address || '-'}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => <TicketStatusCell ticket={row.original} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mức ưu tiên" />
    ),
    cell: ({ row }) => {
      const priorityValue = row.getValue('priority')
      const priority = ticketPriorities.find(
        (item) => item.value === priorityValue,
      )

      if (!priority) {
        return (
          <span className="text-xs italic text-muted-foreground">Không rõ</span>
        )
      }

      return (
        <div className="flex w-[120px] items-center">
          <Badge variant={priority.variant || 'outline'}>
            {priority.icon && <priority.icon className="mr-2 h-4 w-4" />}
            {priority.label}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'channel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kênh" />
    ),
    cell: ({ row }) => {
      const channelValue = row.getValue('channel')
      const channel = ticketChannels.find((item) => item.value === channelValue)

      if (!channel) {
        return (
          <span className="text-xs italic text-muted-foreground">Không rõ</span>
        )
      }

      return (
        <div className="flex w-[120px] items-center">
          <Badge variant={channel.variant || 'outline'}>
            {channel.icon && <channel.icon className="mr-2 h-4 w-4" />}
            {channel.label}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'assignedToUser',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhân viên phụ trách" />
    ),
    cell: ({ row }) => {
      const assigned = row.original.assignedToUser

      return (
        <div className="w-40">
          {assigned?.fullName || (
            <span className="text-xs italic text-muted-foreground">
              Chưa phân công
            </span>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'openedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời gian mở" />
    ),
    cell: ({ row }) => {
      const openedAt = row.getValue('openedAt')
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[18rem]">
            {openedAt ? dateFormat(openedAt, true) : '-'}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'resolvedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời gian xử lý" />
    ),
    cell: ({ row }) => {
      const resolvedAt = row.getValue('resolvedAt')
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[18rem]">
            {resolvedAt ? dateFormat(resolvedAt, true) : '-'}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[18rem]">
            {dateFormat(row.getValue('createdAt'))}
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
