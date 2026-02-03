import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader'
import { DataTableRowAction } from './DataTableRowAction'
import { dateFormat } from '@/utils/date-format'
import { useState } from 'react'
import ViewLotDialog from './ViewLotDialog'

const LotCodeCell = ({ lot }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <ViewLotDialog
          open={open}
          onOpenChange={setOpen}
          lotId={lot.id}
        />
      )}
      <div
        className="w-[120px] font-medium text-blue-600 cursor-pointer hover:underline"
        onClick={() => setOpen(true)}
      >
        {lot.code}
      </div>
    </>
  )
}

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
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã lô' />
    ),
    cell: ({ row }) => <LotCodeCell lot={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'productName', // Assuming lot has product info
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sản phẩm' />
    ),
    cell: ({ row }) => {
      const product = row.original.product
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {product?.name || row.getValue('productName')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'batchNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số lô' />
    ),
    cell: ({ row }) => <div className='w-[100px]'>{row.getValue('batchNumber')}</div>,
  },
  {
    accessorKey: 'currentQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số lượng' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>{row.getValue('currentQuantity')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'manufactureDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='NSX' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>{dateFormat(row.getValue('manufactureDate'))}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'expiryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='HSD' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>{dateFormat(row.getValue('expiryDate'))}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status === 'active' ? 'Hoạt động' : 'Cạn kiệt'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowAction row={row} />,
  },
]
