import { DataTableColumnHeader } from './DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowAction'
import { dateFormat } from '@/utils/date-format'
import { normalizeText } from '@/utils/normalize-text'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Ticket } from 'lucide-react'
import { taskPriorities, taskStatuses } from '../data'
import TaskDetailDialog from './TaskDetailDialog'
import TaskStatusDialog from './TaskStatusDialog'

export const columns = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu đề" />
    ),
    cell: ({ row }) => {
      const task = row.original
      const priority = taskPriorities.find((p) => p.value === task.priority)

      return (
        <TaskDetailDialog taskId={task.id}>
          <button
            type="button"
            className="flex max-w-lg items-center gap-2 text-left text-primary hover:underline"
          >
            <span className="truncate">{task.title}</span>
            {priority && (
              <Badge variant={priority.variant}>{priority.label}</Badge>
            )}
          </button>
        </TaskDetailDialog>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const title = normalizeText(row.original.title || '')
      const searchValue = normalizeText(value || '')
      return title.includes(searchValue)
    },
  },
  {
    id: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: ({ row }) => {
      const customer = row.original.customer

      if (!customer) return <span className="text-muted-foreground">-</span>

      return (
        <div className="flex w-60 flex-col">
          <span className="font-medium">
            {customer.code ? `${customer.code} - ` : ''}
            {customer.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {customer.phone || customer.email || 'Không có thông tin liên lạc'}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'ticket',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phiếu hỗ trợ" />
    ),
    cell: ({ row }) => {
      const ticket = row.original.ticket

      if (!ticket) {
        return <Badge variant="outline">Không có</Badge>
      }

      return (
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          <div className="max-w-xs">
            <div className="font-medium">#{ticket.id}</div>
            <div className="truncate text-xs text-muted-foreground">
              {ticket.subject}
            </div>
          </div>
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
    cell: ({ row }) => {
      const statusValue = row.getValue('status')
      const status = taskStatuses.find((s) => s.value === statusValue)
      const task = row.original

      if (!status) {
        return (
          <span className="text-xs italic text-muted-foreground">Không rõ</span>
        )
      }

      return (
        <TaskStatusDialog taskId={task.id} currentStatus={statusValue}>
          <button type="button" className="focus:outline-none">
            <Badge variant={status.variant}>{status.label}</Badge>
          </button>
        </TaskStatusDialog>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'assignedToUser',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NV phụ trách" />
    ),
    cell: ({ row }) => {
      const assigned = row.original.assignedToUser

      return (
        <div className="flex w-40 items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>
            {assigned?.fullName || (
              <span className="text-xs italic text-muted-foreground">
                Chưa phân công
              </span>
            )}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hạn hoàn thành" />
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue('dueDate')
      const completedAt = row.original.completedAt

      if (!dueDate) return <span>-</span>

      const isOverdue = !completedAt && new Date(dueDate) < new Date()

      return (
        <div
          className={`flex items-center gap-2 ${isOverdue ? 'font-medium text-destructive' : ''}`}
        >
          {isOverdue ? (
            <Clock className="h-4 w-4" />
          ) : (
            <Calendar className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{dateFormat(dueDate)}</span>
          {isOverdue && <Badge variant="destructive">Quá hạn</Badge>}
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
      const createdAt = row.getValue('createdAt')
      return (
        <span className="truncate">
          {createdAt ? dateFormat(createdAt) : '-'}
        </span>
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
    enableHiding: false,
  },
]
