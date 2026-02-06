import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { useState } from 'react'
import ViewReceiptDialog from './ViewReceiptDialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useDispatch } from 'react-redux'
import { getReceiptById, updateReceiptStatus, getReceipts } from '@/stores/ReceiptSlice'
import UpdateReceiptStatusDialog from './UpdateReceiptStatusDialog'
import { receiptStatus, paymentMethods } from '../data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Pencil } from 'lucide-react'

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
      <DataTableColumnHeader column={column} title="Mã PT" />
    ),
    cell: function Cell({ row }) {
      const [showViewReceiptDialog, setShowViewReceiptDialog] = useState(false)
      const handleViewReceipt = () => {
        setShowViewReceiptDialog(true)
      }

      return (
        <>
          {showViewReceiptDialog && (
            <ViewReceiptDialog
              open={showViewReceiptDialog}
              onOpenChange={setShowViewReceiptDialog}
              receiptId={row.original.id}
              showTrigger={false}
            />
          )}
          <div
            className={cn("w-28 cursor-pointer text-primary hover:underline")}
            onClick={handleViewReceipt}
          >
            <div className="flex items-center gap-2">
              <span>{row.getValue('code')}</span>
              {row.original.isDeposit && (
                <Badge variant="secondary" className="text-xs">
                  Cọc
                </Badge>
              )}
            </div>
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'receiverType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => (
      <div className="w-28">
        <Badge variant="outline">
          {row.getValue('receiverType') === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'}
        </Badge>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lý do" />
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
      <DataTableColumnHeader column={column} title="Ngày thanh toán" />
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
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
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
      const paymentMethodObj = paymentMethods.find(m => m.value === method)
      const Icon = paymentMethodObj?.icon

      return (
        <div className="w-36">
          <Badge variant="outline" className={`whitespace-nowrap ${paymentMethodObj?.color}`}>
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {paymentMethodObj?.label || method}
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
          await dispatch(updateReceiptStatus({ id, status: newStatus })).unwrap()
          toast.success('Cập nhật trạng thái thành công')
          setShowUpdateStatusDialog(false)
          // Refresh list - assumes parent component handles it or we dispatch generic getReceipts
          // But getReceipts usually needs params. 
          // However, Since Redux updates state, if the list comes from Redux store, it might auto-update if we update the single item or refetch.
          // Let's try dispatching a refresh if possible, or assume the slice handles updating the item in the list.
          // Checking SalesContractSlice -> updateReceiptStatus usually just updates.
          // Ideally we should refetch.
          dispatch(getReceipts({}))
        } catch (error) {
          // Error handled in slice/thunk mostly
          console.error(error)
        }
      }

      return (
        <>
          <div className="w-28 flex items-center gap-2">
            <Badge
              className={`cursor-pointer hover:underline ${status === 'completed' ? 'bg-green-500' : status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`}
              onClick={() => setShowUpdateStatusDialog(true)}
            >
              {status === 'completed' ? 'Đã thu' : status === 'draft' ? 'Nháp' : status === 'cancelled' ? 'Đã hủy' : status}
            </Badge>
          </div>
          {showUpdateStatusDialog && (
            <UpdateReceiptStatusDialog
              open={showUpdateStatusDialog}
              onOpenChange={setShowUpdateStatusDialog}
              receiptId={row.original.id}
              currentStatus={status}
              statuses={receiptStatus}
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
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-36 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('updatedAt'), true)}
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
