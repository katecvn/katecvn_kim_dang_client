import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { useState } from 'react'
import PriceLogDialog from './PriceLogDialog'
import { PRODUCT_SOURCE, PRODUCT_TYPE } from '../data'
import { normalizeText } from '@/utils/normalize-text'
import ViewProductDialog from './ViewProductDialog'
import Can from '@/utils/can'
import { IconInfoCircle } from '@tabler/icons-react'
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
      <DataTableColumnHeader column={column} title="Mã" />
    ),
    cell: function Cell({ row }) {
      const [showViewProductDialog, setShowViewProductDialog] = useState(false)

      return (
        <>
          <Can permission={'GET_PRODUCT'}>
            {showViewProductDialog && (
              <ViewProductDialog
                open={showViewProductDialog}
                onOpenChange={setShowViewProductDialog}
                productId={row.original.id}
                showTrigger={false}
              />
            )}
          </Can>

          <span
            className="cursor-pointer text-primary hover:underline"
            onClick={() => setShowViewProductDialog(true)}
          >
            {row.getValue('code')}
            <br />
            {row.original.prices?.length > 1 ? (
              <span className="text-orange-500">
                {row.original.prices.length} lịch sử giá
              </span>
            ) : (
              ''
            )}
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
      <DataTableColumnHeader column={column} title="Tên sản phẩm" />
    ),
    cell: ({ row }) => <div className="w-28">{row.getValue('name')}</div>,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.name)
      const searchValue = normalizeText(value)

      return name.includes(searchValue)
    },
  },
  {
    accessorKey: 'categoryId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
    cell: ({ row }) => {
      return <div className="w-28">{row.original?.category?.name}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original?.categoryId)
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'coefficient',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="HS Lương" />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-16 text-center">
          {row.original?.coefficient?.coefficient}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nguồn" />
    ),
    cell: ({ row }) => {
      const sourceKey = row.getValue('source')
      const source = PRODUCT_SOURCE.find((item) => item.value === sourceKey)
      return (
        <div className="w-16">{source ? source.name : 'Không xác định'}</div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      const sourceKey = row.getValue('type')
      const source = PRODUCT_TYPE.find((item) => item.value === sourceKey)
      return (
        <div className="w-20">{source ? source.name : 'Không xác định'}</div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá" />
    ),
    cell: function Cell({ row }) {
      const [showPriceLogDialog, setShowPriceLogDialog] = useState(false)

      return (
        <div>
          <div
            className="flex cursor-pointer space-x-2"
            onClick={() => setShowPriceLogDialog(true)}
          >
            <span className="max-w-32 truncate hover:text-primary hover:underline sm:max-w-72 md:max-w-[31rem]">
              {moneyFormat(row.getValue('price'))}
              <IconInfoCircle className="ml-1 inline-block size-4" />
            </span>
          </div>

          {showPriceLogDialog && (
            <PriceLogDialog
              open={showPriceLogDialog}
              onOpenChange={setShowPriceLogDialog}
              product={row.original}
              showTrigger={false}
            />
          )}
        </div>
      )
    },
    enableSorting: true,
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
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
