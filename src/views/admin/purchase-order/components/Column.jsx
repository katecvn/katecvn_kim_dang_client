import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { normalizeText } from '@/utils/normalize-text'
import { Checkbox } from '@/components/ui/checkbox'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { purchaseOrderStatuses, purchaseOrderPaymentStatuses } from '../data'
import { useState } from 'react'
import Can from '@/utils/can'

import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import {
  updatePurchaseOrderStatus,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  revertPurchaseOrder
} from '@/stores/PurchaseOrderSlice'
import { Badge } from '@/components/ui/badge'
import UpdatePurchaseOrderStatusDialog from './UpdatePurchaseOrderStatusDialog'
import { Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export const getColumns = (onView) => [
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
    cell: ({ row }) => {
      return (
        <div
          className="cursor-pointer font-medium text-blue-600 hover:underline"
          onClick={() => onView(row.original.id)}
        >
          {row.original.code}
        </div>
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
            <span className="flex items-center gap-1 text-primary underline hover:text-secondary-foreground">
              <Phone className="h-3 w-3" />
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
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      const amount = row.original.totalAmount
      const discount = row.original.discountAmount

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
    cell: ({ row }) => <span>{moneyFormat(row.original.taxAmount || 0)}</span>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'debt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Công nợ" />
    ),
    cell: ({ row }) => {
      const order = row.original
      const paymentStatus = order?.paymentStatus
      const totalAmount = parseFloat(order?.totalAmount || 0)
      const paidAmount = parseFloat(order?.paidAmount || 0)
      const remainingAmount = totalAmount - paidAmount

      // If fully paid
      if (paymentStatus === 'paid' || remainingAmount <= 0) {
        return <span className="text-green-500">Thanh toán toàn bộ</span>
      }

      // If partially paid
      if (paidAmount > 0 && remainingAmount > 0) {
        return (
          <span className="text-yellow-600">
            Còn nợ: {moneyFormat(remainingAmount)}
          </span>
        )
      }

      // If not paid at all
      if (paidAmount === 0) {
        return (
          <span className="text-red-500">
            Còn nợ: {moneyFormat(remainingAmount)}
          </span>
        )
      }

      return (
        <span className="italic text-muted-foreground">
          Chưa thanh toán
        </span>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row }) {
      const dispatch = useDispatch()
      const [openUpdateStatus, setOpenUpdateStatus] = useState(false)
      const currentStatus = row.original.status
      const statusObj = purchaseOrderStatuses.find((s) => s.value === currentStatus)
      const paymentStatus = row.original.paymentStatus || 'unpaid'
      const paymentStatusObj = purchaseOrderPaymentStatuses.find(
        (s) => s.value === paymentStatus
      )

      const handleSubmit = async (nextStatus) => {
        try {
          if (nextStatus === 'ordered') {
            await dispatch(confirmPurchaseOrder(row.original.id)).unwrap()
          } else if (nextStatus === 'cancelled') {
            await dispatch(cancelPurchaseOrder(row.original.id)).unwrap()
          } else if (nextStatus === 'draft' && row.original.status === 'ordered') {
            await dispatch(revertPurchaseOrder(row.original.id)).unwrap()
          } else {
            await dispatch(
              updatePurchaseOrderStatus({ id: row.original.id, status: nextStatus }),
            ).unwrap()
          }
          toast.success('Cập nhật trạng thái đơn đặt hàng thành công')
          setOpenUpdateStatus(false)
        } catch (error) {
          console.log('Submit error: ', error)
        }
      }

      const isTerminalStatus = ['cancelled', 'completed'].includes(currentStatus)

      return (
        <>
          {openUpdateStatus && (
            <UpdatePurchaseOrderStatusDialog
              open={openUpdateStatus}
              onOpenChange={setOpenUpdateStatus}
              purchaseOrderId={row.original.id}
              currentStatus={currentStatus}
              statuses={purchaseOrderStatuses}
              onSubmit={handleSubmit}
            />
          )}

          <div className="flex flex-col gap-2">
            <Badge
              className={cn(
                'select-none',
                currentStatus === 'completed'
                  ? 'cursor-default bg-transparent p-0 text-green-600 hover:bg-transparent shadow-none border-0'
                  : `cursor-pointer ${statusObj?.bgColor || ''}`,
              )}
              onClick={() => !isTerminalStatus && setOpenUpdateStatus(true)}
              title={!isTerminalStatus ? 'Bấm để cập nhật trạng thái' : ''}
            >
              <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                {statusObj?.icon ? (
                  <statusObj.icon className="h-4 w-4" />
                ) : null}
              </span>
              {statusObj?.label || 'Không xác định'}
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-default select-none border-0 ${paymentStatusObj?.color || 'text-gray-500'}`}
            >
              <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                {paymentStatusObj?.icon ? (
                  <paymentStatusObj.icon className="h-4 w-4" />
                ) : null}
              </span>
              {paymentStatusObj?.label || 'Không xác định'}
            </Badge>
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'expectedDeliveryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày dự kiến giao" />
    ),
    cell: ({ row }) => {
      const deliveryDate = row.original.expectedDeliveryDate
      const status = row.original.status

      if (!deliveryDate) return <span className="text-muted-foreground italic">—</span>

      const date = new Date(deliveryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if overdue: date < today AND not delivered /received
      const isOverdue = date < today && !['received', 'completed', 'cancelled'].includes(status)

      return (
        <span
          className={isOverdue ? 'text-red-500 font-bold' : ''}
          title={isOverdue ? 'Quá hạn giao hàng' : ''}
        >
          {dateFormat(deliveryDate)}
        </span>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'createdByUser',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => {
      const user = row.original.createdByUser
      const createdAt = row.original.createdAt

      return (
        <div className="flex w-32 flex-col">
          <span className="truncate font-medium" title={user?.fullName}>
            {user?.fullName || '—'}
          </span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(createdAt, true)}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const userId = row.original?.createdByUser?.id
      return userId ? value.map(String).includes(String(userId)) : false
    },

    accessorFn: (row) => row.createdByUser?.id || null,

    sortingFn: (rowA, rowB) => {
      const idA = rowA.original?.createdByUser?.id || 0
      const idB = rowB.original?.createdByUser?.id || 0
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
