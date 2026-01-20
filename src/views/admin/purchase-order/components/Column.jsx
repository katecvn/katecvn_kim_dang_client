import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { normalizeText } from '@/utils/normalize-text'
import { Checkbox } from '@/components/ui/checkbox'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { statuses } from '../data'
import { useState } from 'react'
import Can from '@/utils/can'
import ViewPurchaseOrderDialog from './ViewPurchaseOrderDialog'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { updatePurchaseOrderStatus } from '@/stores/PurchaseOrderSlice'
import { Badge } from '@/components/ui/badge'
import UpdatePurchaseOrderStatusDialog from './UpdatePurchaseOrderStatusDialog'

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
    id: 'code',
    accessorFn: (row) => normalizeText(row.code || ''),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã ĐĐH" />
    ),
    cell: function Cell({ row }) {
      const [showViewDialog, setShowViewDialog] = useState(false)

      return (
        <>
          <Can permission={'GET_PURCHASE_ORDER'}>
            {showViewDialog && (
              <ViewPurchaseOrderDialog
                open={showViewDialog}
                onOpenChange={setShowViewDialog}
                purchaseOrderId={row.original.id}
                showTrigger={false}
              />
            )}
          </Can>

          <span
            className="cursor-pointer hover:text-primary"
            onClick={() => setShowViewDialog(true)}
          >
            {row.original.code}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: 'supplier',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhà cung cấp" />
    ),
    cell: function Cell({ row }) {
      const { supplier } = row.original

      return (
        <div
          className="flex w-40 flex-col break-words"
          title={supplier?.name}
        >
          <span className="font-semibold">{supplier?.name}</span>

          {supplier?.taxCode && (
            <span className="text-xs text-muted-foreground">
              MST: {supplier?.taxCode}
            </span>
          )}

          {supplier?.phone && (
            <span className="text-primary underline hover:text-secondary-foreground">
              <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const supplier = row.original.supplier
      const searchableText = normalizeText(
        `${supplier?.name || ''} ${supplier?.taxCode || ''}`,
      )
      const searchValue = normalizeText(value)
      return searchableText.includes(searchValue)
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      const amount = row.original.amount
      const discount = row.original.discount

      return (
        <div className="flex flex-col">
          <span className="font-medium">{moneyFormat(amount)}</span>

          {discount > 0 && (
            <span className="text-xs text-red-500">
              Giảm: {moneyFormat(discount)}
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'taxAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thuế" />
    ),
    cell: ({ row }) => <span>{moneyFormat(row.original.taxAmount)}</span>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row }) {
      const dispatch = useDispatch()
      const [openUpdateStatus, setOpenUpdateStatus] = useState(false)
      const currentStatus = row.original.status
      const statusObj = statuses.find((s) => s.value === currentStatus)

      const handleSubmit = async (nextStatus) => {
        try {
          await dispatch(
            updatePurchaseOrderStatus({ id: row.original.id, status: nextStatus }),
          ).unwrap()
          toast.success('Cập nhật trạng thái đơn đặt hàng thành công')
          setOpenUpdateStatus(false)
        } catch (error) {
          console.log('Submit error: ', error)
          toast.error('Cập nhật trạng thái thất bại')
        }
      }

      return (
        <>
          {openUpdateStatus && (
            <UpdatePurchaseOrderStatusDialog
              open={openUpdateStatus}
              onOpenChange={setOpenUpdateStatus}
              purchaseOrderId={row.original.id}
              currentStatus={currentStatus}
              statuses={statuses}
              onSubmit={handleSubmit}
            />
          )}

          <Badge
            variant="outline"
            className={`cursor-pointer select-none ${statusObj?.color || ''}`}
            onClick={() => setOpenUpdateStatus(true)}
            title="Bấm để cập nhật trạng thái"
          >
            <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
              {statusObj?.icon ? <statusObj.icon className="h-4 w-4" /> : null}
            </span>
            {statusObj?.label || 'Không xác định'}
          </Badge>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => {
      const user = row.original.user
      const createdAt = row.original.createdAt

      return (
        <div className="flex w-32 flex-col">
          <span className="truncate font-medium" title={user?.fullName}>
            {user?.fullName || '—'}
          </span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(createdAt)}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const userId = row.original?.user?.id
      return userId ? value.map(String).includes(String(userId)) : false
    },

    accessorFn: (row) => row.user?.id || null,

    sortingFn: (rowA, rowB) => {
      const idA = rowA.original?.user?.id || 0
      const idB = rowB.original?.user?.id || 0
      return idA - idB
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
