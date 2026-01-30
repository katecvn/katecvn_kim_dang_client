import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updatePaymentStatus, getPayments } from '@/stores/PaymentSlice'
import UpdatePaymentStatusDialog from './UpdatePaymentStatusDialog'
import { paymentStatus } from '../data'
import { toast } from 'sonner'

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
      <DataTableColumnHeader column={column} title="Mã PC" />
    ),
    cell: ({ row }) => {
      return (
        <div className={cn("w-28 font-medium")}>
          {row.getValue('code')}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'receiverType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người nhận" />
    ),
    cell: ({ row }) => (
      <div className="w-28">
        <Badge variant="outline">
          {row.getValue('receiverType') === 'customer' ? 'Khách hàng' :
            row.getValue('receiverType') === 'supplier' ? 'Nhà cung cấp' :
              row.getValue('receiverType') || 'Khác'}
        </Badge>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lý do chi" />
    ),
    cell: ({ row }) => (
      <div className="w-48 truncate" title={row.getValue('reason')}>
        {row.getValue('reason') || 'Không có'}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'paymentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày chi" />
    ),
    cell: ({ row }) => (
      <div className="w-36">{dateFormat(row.getValue('paymentDate'), true)}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số tiền" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="font-medium text-red-600">
            {moneyFormat(row.getValue('amount'))}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phương thức" />
    ),
    cell: ({ row }) => {
      const method = row.getValue('paymentMethod')
      return (
        <div className="w-28">
          <Badge variant="outline">
            {method === 'cash' ? 'Tiền mặt' : method === 'transfer' ? 'Chuyển khoản' : method}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row }) {
      const status = row.getValue('status')
      const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
      const dispatch = useDispatch()

      const handleUpdateStatus = async (newStatus, id) => {
        try {
          await dispatch(updatePaymentStatus({ id, status: newStatus })).unwrap()
          // Optionally refresh list if needed, or rely on optimistic/Redux update.
          // Re-fetching to be safe and consistent with other modules
          dispatch(getPayments({}))
          setShowUpdateStatusDialog(false)
        } catch (error) {
          console.error(error)
        }
      }

      return (
        <>
          <div className="w-28">
            <Badge
              className={cn(
                "cursor-pointer hover:underline",
                status === 'completed' ? 'bg-green-500' :
                  status === 'cancelled' ? 'bg-red-500' :
                    'bg-yellow-500'
              )}
              onClick={() => setShowUpdateStatusDialog(true)}
            >
              {status === 'completed' ? 'Đã chi' : status === 'draft' ? 'Nháp' : status === 'cancelled' ? 'Đã hủy' : status}
            </Badge>
          </div>
          {showUpdateStatusDialog && (
            <UpdatePaymentStatusDialog
              open={showUpdateStatusDialog}
              onOpenChange={setShowUpdateStatusDialog}
              paymentId={row.original.id}
              currentStatus={status}
              statuses={paymentStatus}
              onSubmit={handleUpdateStatus}
              contentClassName="z-[10002]"
              overlayClassName="z-[10001]"
            />
          )}
        </>
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
