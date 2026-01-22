import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { normalizeText } from '@/utils/normalize-text'
import { useState } from 'react'
import ViewReceiptDialog from './ViewReceiptDialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { updatePaymentStatus } from '@/stores/PaymentSlice'
import { getMyReceipts, getReceipts } from '@/stores/ReceiptSlice'
import { Checkbox } from '@/components/ui/checkbox'

const getNearestDueDateInfo = (payments = []) => {
  const pendingPayments = payments.filter(
    (p) => p.dueDate && p.status !== 'success',
  )

  if (!pendingPayments.length) return null

  const nearest = pendingPayments
    .map((p) => new Date(p.dueDate))
    .sort((a, b) => a - b)[0]

  const today = new Date()
  const diffMs = nearest.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  let color = 'bg-green-500'
  let label = `Còn ${diffDays} ngày`

  if (diffDays < 0) {
    color = 'bg-destructive'
    label = `Quá hạn ${Math.abs(diffDays)} ngày`
  } else if (diffDays === 0) {
    color = 'bg-orange-500'
    label = 'Hạn hôm nay'
  } else if (diffDays <= 3) {
    color = 'bg-orange-500'
    label = `Còn ${diffDays} ngày`
  }

  return {
    date: nearest,
    diffDays,
    label,
    color,
  }
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
      return (
        <>
          {showViewReceiptDialog && (
            <ViewReceiptDialog
              open={showViewReceiptDialog}
              onOpenChange={setShowViewReceiptDialog}
              receipt={row.original}
              showTrigger={false}
            />
          )}
          <div
            className="w-28 cursor-pointer text-primary hover:underline"
            onClick={() => setShowViewReceiptDialog(true)}
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
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: ({ row }) => (
      <div
        className="flex w-40 flex-col break-words"
        title={row.original.customer.name}
      >
        <span className="font-semibold">{row.original.customer.name}</span>
        <span className="text-muted-foreground">
          <a
            className="text-primary underline hover:text-secondary-foreground"
            href={`mailto:${row.original.customer.email}`}
          >
            {row.original.customer.email}
          </a>
        </span>
        <span className="text-muted-foreground">
          <a href={`tel:${row.original.customer.phone}`}>
            {row.original.customer.phone}
          </a>
        </span>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const customerName = normalizeText(row.original.customer.name)
      const searchValue = normalizeText(value)

      return customerName.includes(searchValue)
    },
  },
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => (
      <div className="w-32 truncate" title={row.original.user?.fullName}>
        {row.original.user?.fullName}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày lập" />
    ),
    cell: ({ row }) => (
      <div className="w-28">{dateFormat(row.getValue('date'))}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {moneyFormat(row.getValue('totalAmount'))}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'paidAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đã thanh toán" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {moneyFormat(row.original.debt.paidAmount)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'debt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nợ" />
    ),
    cell: function Cell({ row }) {
      const payments = row.original.payments
      const debtStatus = row.original.debt.status
      const paymentId = payments[0]?.id

      const dispatch = useDispatch()
      const handleUpdatePaymentStatus = async () => {
        try {
          if (!payments.length) {
            toast.warning(
              'Vui lòng thêm ít nhất 1 khoản thanh toán cho phiếu thu',
            )
            return
          }
          if (payments.length > 1) {
            toast.warning(
              'Có nhiều khoản thu đối với phiếu thu này!!! Xem chi tiết từng khoản thu trước khi duyệt',
            )
            return
          }
          if (debtStatus === 'closed') {
            toast.warning('Phiếu thu này đã được thu toàn bộ')
            return
          }
          const isConfirmed = window.confirm(
            'Bạn có chắc muốn duyệt nhanh khoản thanh toán cho phiếu thu này chứ',
          )
          if (isConfirmed) {
            await dispatch(
              updatePaymentStatus({ id: paymentId, status: 'success' }),
            ).unwrap()
            const getAllReceipt = JSON.parse(
              localStorage.getItem('permissionCodes'),
            ).includes('GET_RECEIPT')
            getAllReceipt
              ? await dispatch(getReceipts()).unwrap()
              : await dispatch(getMyReceipts()).unwrap()
          }
        } catch (error) {
          console.log('Submit error: ', error)
        }
      }

      return (
        <div
          className="flex cursor-pointer space-x-2"
          onClick={() => {
            handleUpdatePaymentStatus()
          }}
        >
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            <Badge
              className={
                row.original.debt.remainingAmount > 0
                  ? 'bg-destructive'
                  : 'bg-green-500'
              }
            >
              {row.original.debt.remainingAmount > 0
                ? moneyFormat(row.original.debt.remainingAmount)
                : 'Đã thanh toán hết'}
            </Badge>
          </span>
        </div>
      )
    },
  },
  {
    id: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hạn chót" />
    ),
    cell: ({ row }) => {
      const dueInfo = getNearestDueDateInfo(row.original.payments)
      if (!dueInfo) {
        return null
      }
      return (
        <div className="">
          <Badge className={dueInfo.color}>
            {`${dateFormat(dueInfo.date)} (${dueInfo.label})`}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
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
