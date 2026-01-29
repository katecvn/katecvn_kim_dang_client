import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { normalizeText } from '@/utils/normalize-text'
import { Badge } from '@/components/ui/badge'
import { statuses } from '../data'
import { useState } from 'react'
import UpdateSupplierStatusDialog from './UpdateSupplierStatusDialog'
import ViewSupplierDialog from './ViewSupplierDialog'

export const columns = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-14">{row.index + 1}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên nhà cung cấp" />
    ),
    cell: function Cell({ row }) {
      const [showViewSupplierDialog, setShowViewSupplierDialog] =
        useState(false)

      return (
        <>
          {showViewSupplierDialog && (
            <ViewSupplierDialog
              open={showViewSupplierDialog}
              onOpenChange={setShowViewSupplierDialog}
              supplierId={row?.original?.id}
              showTrigger={false}
            />
          )}

          <span
            className="w-44 cursor-pointer text-primary hover:underline"
            onClick={() => setShowViewSupplierDialog(true)}
          >
            {row.getValue('name')}
          </span>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.name)
      const searchValue = normalizeText(value)
      return name.includes(searchValue)
    },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số điện thoại" />
    ),
    cell: ({ row }) => <div className="w-28">{row.getValue('phone')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Địa chỉ" />
    ),
    cell: ({ row }) => <div className="w-28">{row.getValue('address')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'taxCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã số thuế" />
    ),
    cell: ({ row }) => (
      <div className="w-28">{row.getValue('taxCode') || 'Không có'}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row }) {
      const statusValue = row.getValue('status')
      const status = statuses.find((status) => status.value === statusValue) || {
        value: statusValue,
        label: statusValue,
        icon: null,
      }
      const [
        showUpdateSupplierStatusDialog,
        setShowUpdateSupplierStatusDialog,
      ] = useState(false)

      return (
        <>
          <div
            className="flex w-[150px] cursor-pointer items-center"
            onClick={() => setShowUpdateSupplierStatusDialog(true)}
          >
            <span>
              <Badge
                variant={status.value !== 'published' ? 'destructive' : ''}
              >
                {status.icon && <status.icon className="mr-2 h-4 w-4" />}
                {status.label}
              </Badge>
            </span>
          </div>

          {showUpdateSupplierStatusDialog && (
            <UpdateSupplierStatusDialog
              open={showUpdateSupplierStatusDialog}
              onOpenChange={setShowUpdateSupplierStatusDialog}
              supplier={row.original}
              showTrigger={false}
            />
          )}
        </>
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
