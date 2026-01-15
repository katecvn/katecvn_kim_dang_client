import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableRowActions } from './DataTableRowAction'

export const columns = [
  {
    id: 'index',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>
    },
  },

  {
    id: 'productName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sản phẩm" />
    ),
    cell: ({ row }) => {
      const name = row.original.product?.name
      return <div className="max-w-[180px] truncate font-medium">{name}</div>
    },
    accessorFn: (row) => row.product?.name,
  },

  {
    id: 'productCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã SP" />
    ),
    cell: ({ row }) => row.original.productCode || '—',
  },

  {
    id: 'serialNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial" />
    ),
    cell: ({ row }) => row.original.serialNumber || '—',
  },

  {
    id: 'unitName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đơn vị" />
    ),
    cell: ({ row }) => row.original.unitName || '—',
  },

  {
    id: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.quantity}</span>
    ),
  },

  {
    id: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá" />
    ),
    cell: ({ row }) => row.original.price?.toLocaleString('vi-VN') || '—',
  },

  {
    id: 'snapshotDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày chốt" />
    ),
    cell: ({ row }) => {
      const date = row.original.snapshotDate
      return date ? dateFormat(date) : '—'
    },
  },

  {
    id: 'note',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ghi chú" />
    ),
    cell: ({ row }) => {
      const note = row.original.note || '—'
      return (
        <div
          className="max-w-[200px] truncate text-sm text-muted-foreground"
          title={note}
        >
          {note}
        </div>
      )
    },
  },

  {
    id: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
    ),
    cell: ({ row }) => dateFormat(row.original.updatedAt, 'DD/MM/YYYY HH:mm'),
  },

  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
