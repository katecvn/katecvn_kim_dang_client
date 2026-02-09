import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { Badge } from '@/components/ui/badge'
import { statuses, types } from '../data'
import { normalizeText } from '@/utils/normalize-text'
import ViewCategoryDialog from './ViewCategoryDialog'
import { useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'

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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã danh mục" />
    ),
    cell: function Cell({ row }) {
      const [open, setOpen] = useState(false)
      const code = row.getValue('code') ?? '—'
      const id = row?.original?.id

      return (
        <>
          {open && (
            <ViewCategoryDialog
              open={open}
              onOpenChange={setOpen}
              categoryId={id}
              showTrigger={false}
            />
          )}

          <span
            className="inline-block w-28 cursor-pointer text-primary hover:underline"
            onClick={() => setOpen(true)}
            title="Xem chi tiết danh mục"
          >
            {code}
          </span>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên danh mục" />
    ),
    cell: ({ row }) => <div className="w-36">{row.getValue('name')}</div>,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.name)
      const searchValue = normalizeText(value)

      return name.includes(searchValue)
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại doanh mục" />
    ),
    cell: ({ row }) => {
      const typeValue = row.getValue('type')
      const type = types.find((type) => type.value === typeValue)
      return <div className="flex w-32 items-center">{type.label}</div>
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
      const statusValue = row.getValue('status')
      const status = statuses.find((status) => status.value === statusValue)

      return (
        <div className="flex w-[150px] items-center">
          <Badge
            variant="outline"
            className={
              status.value === 'published'
                ? 'border-green-600 text-green-600'
                : 'border-red-600 text-red-600'
            }
          >
            {status.icon && <status.icon className="mr-2 h-4 w-4" />}
            {status.label}
          </Badge>
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
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('createdAt'))}
          </span>
        </div>
      )
    },
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
