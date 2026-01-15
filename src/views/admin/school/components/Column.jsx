import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { statuses } from '../data'
import provinces from '@/utils/province'
import { useState } from 'react'
import { dateFormat } from '@/utils/date-format'
import { DataTableRowActions } from './DataTableRowAction'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ViewSchoolDialog from './ViewSchoolDialog'

export const columns = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên trường" />
    ),
    cell: function Cell({ row }) {
      const [showViewSchoolDialog, setShowViewSchoolDialog] = useState(false)
      return (
        <div>
          <div
            className="flex w-40 cursor-pointer items-center"
            title={row.getValue('name')}
            onClick={() => setShowViewSchoolDialog(true)}
          >
            <Avatar className="mr-2 rounded-lg">
              <AvatarImage
                src={
                  row.original.logo
                    ? `${import.meta.env.VITE_KAFOOD_SERVER_URL}/${row.original.logo}`
                    : `https://ui-avatars.com/api/?bold=true&background=random&name=${encodeURIComponent(
                        row.original.name,
                      )}`
                }
                alt={row.getValue('name')}
              />
              <AvatarFallback>
                {row.original.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate whitespace-normal break-words text-sm">
              {row.getValue('name')}
            </span>
          </div>
          {showViewSchoolDialog && (
            <ViewSchoolDialog
              school={row.original}
              open={showViewSchoolDialog}
              onOpenChange={setShowViewSchoolDialog}
              showTrigger={false}
            />
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'author',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên chủ trường" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2" title={row.getValue('author')}>
          <span className="max-w-32 truncate">{row.getValue('author')}</span>
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
      const statusFromApi = row.getValue('status')
      const status = statuses.find((status) => status.value === statusFromApi)

      if (!status) {
        return null
      }

      return (
        <div className="flex w-28 items-center">
          <span>
            <Badge variant={status.value !== 'active' ? 'destructive' : ''}>
              {status.icon && <status.icon className="mr-2 h-4 w-4" />}
              {status.label}
            </Badge>
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'account',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SĐT đăng nhập" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="w-24 truncate">{row.getValue('account')}</span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'expirationTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày hết hạn" />
    ),
    cell: ({ row }) => {
      const expirationDate = new Date(row.getValue('expirationTime'))
      const currentDate = new Date()
      const daysLeft = Math.ceil(
        (expirationDate - currentDate) / (1000 * 60 * 60 * 24),
      )

      return (
        <div className="flex space-x-2">
          <span
            className={`w-20 truncate ${
              daysLeft <= 0
                ? 'text-red-500'
                : daysLeft <= 7
                  ? 'text-yellow-500'
                  : ''
            }`}
          >
            {dateFormat(row.getValue('expirationTime'))}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'studentCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Học sinh" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="w-18 truncate text-center">
            {row.getValue('studentCount')} / {row.original.maxStudent}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'userCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giáo viên" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="w-18 truncate text-center">
            {row.getValue('userCount')} / {row.original.maxUser}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'provinceId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tỉnh thành" />
    ),
    cell: ({ row }) => {
      const provinceId = row.getValue('provinceId')
      const province = provinces.find((province) => province.id === provinceId)

      return (
        <div className="flex space-x-2">
          <span className="w-40 truncate">
            {province ? province.name : 'Chưa xác định'}
          </span>
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
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người phụ trách" />
    ),
    cell: ({ row }) => {
      const users = row.original?.users || []
      const lastUser = users.length ? users.at(-1).fullName : 'Không có'

      return (
        <div className="flex space-x-2" title={lastUser}>
          <span className="w-28 truncate">{lastUser}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const users = row.original?.users || []
      return users.some((user) => value.includes(user.id))
    },
    sortingFn: (rowA, rowB) => {
      const usersA = rowA.original?.users || []
      const usersB = rowB.original?.users || []
      const lastUserIdA = usersA.length ? usersA.at(-1).id : 0
      const lastUserIdB = usersB.length ? usersB.at(-1).id : 0
      return lastUserIdA - lastUserIdB
    },
    accessorFn: (row) => row.users?.at(-1)?.id || null,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'plan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="w-20 truncate">
            {row.original?.licenses.length ? (
              row.original?.licenses[row.original?.licenses.length - 1]
                ?.plan === 'demo' ? (
                <span className="font-bold text-primary">Miễn phí</span>
              ) : (
                <span className="font-bold text-green-500">Trả phí</span>
              )
            ) : (
              <span className="font-bold text-primary">Miễn phí</span>
            )}
          </span>
        </div>
      )
    },
    accessorFn: (row) => row.licenses[row.licenses.length - 1]?.plan || 'demo',
    filterFn: (row, columnId, value) => {
      return value.includes(row.getValue(columnId))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="w-20 truncate text-center">
            {dateFormat(row.getValue('createdAt'))}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'lastTimeUsed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lần cuối SD" />
    ),
    cell: ({ row }) => {
      const lastTimeUsed = row.getValue('lastTimeUsed')
        ? new Date(row.getValue('lastTimeUsed'))
        : null

      const now = new Date()
      const tenDaysAgo = new Date(now)
      tenDaysAgo.setDate(now.getDate() - 10)

      const latestUsedAt = lastTimeUsed ? dateFormat(lastTimeUsed) : null

      let badgeClass
      switch (true) {
        case !lastTimeUsed:
          badgeClass = 'bg-red-500 dark:text-white'
          break
        case lastTimeUsed >= tenDaysAgo:
          badgeClass = 'bg-green-500 dark:text-primary'
          break
        case lastTimeUsed < tenDaysAgo:
          badgeClass = 'bg-orange-500 dark:text-primary'
          break
        default:
          badgeClass = 'bg-gray-500 dark:text-white'
      }

      return (
        <span className="w-40 truncate text-center">
          {latestUsedAt ? (
            <Badge className={badgeClass}>{latestUsedAt}</Badge>
          ) : (
            <Badge variant="destructive">Không SD</Badge>
          )}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableGlobalFilter: false,
  },
]
