import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { useState } from 'react'
import ViewReceiptDialog from './ViewReceiptDialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useDispatch } from 'react-redux'
import { getReceiptById } from '@/stores/ReceiptSlice'

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
      const [receiptDetail, setReceiptDetail] = useState(null)
      const [loading, setLoading] = useState(false)
      const dispatch = useDispatch()

      const handleViewReceipt = async () => {
        setLoading(true)
        try {
          const result = await dispatch(getReceiptById(row.original.id)).unwrap()
          setReceiptDetail(result)
          setShowViewReceiptDialog(true)
        } catch (error) {
          console.error('Error fetching receipt:', error)
          // Fallback to list data if fetch fails
          setReceiptDetail(row.original)
          setShowViewReceiptDialog(true)
        } finally {
          setLoading(false)
        }
      }

      return (
        <>
          {showViewReceiptDialog && receiptDetail && (
            <ViewReceiptDialog
              open={showViewReceiptDialog}
              onOpenChange={setShowViewReceiptDialog}
              receipt={receiptDetail}
              showTrigger={false}
            />
          )}
          <div
            className={`w-28 cursor-pointer text-primary hover:underline ${loading ? 'opacity-50' : ''}`}
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
      <div className="w-32">{dateFormat(row.getValue('paymentDate'))}</div>
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
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <div className="w-28">
          <Badge className={status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
            {status === 'completed' ? 'Hoàn thành' : status === 'draft' ? 'Nháp' : status}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hạn chót" />
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue('dueDate')
      if (!dueDate) {
        return <div className="w-28 text-muted-foreground">Không có</div>
      }
      return (
        <div className="w-28">
          {dateFormat(dueDate)}
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
