import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { normalizeText } from '@/utils/normalize-text'
import { Checkbox } from '@/components/ui/checkbox'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { statuses } from '../data'
import { useState } from 'react'
import Can from '@/utils/can'
import ViewInvoiceDialog from './ViewInvoiceDialog'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { updateInvoiceStatus } from '@/stores/InvoiceSlice'
import { Badge } from '@/components/ui/badge'
import UpdateInvoiceStatusDialog from './UpdateInvoiceStatusDialog'

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
      <DataTableColumnHeader column={column} title="Mã HĐ" />
    ),
    cell: function Cell({ row }) {
      const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
      const credit = row.original?.creditNotes || []

      return (
        <>
          <Can permission={'GET_INVOICE'}>
            {showViewInvoiceDialog && (
              <ViewInvoiceDialog
                open={showViewInvoiceDialog}
                onOpenChange={setShowViewInvoiceDialog}
                invoiceId={row.original.id}
                showTrigger={false}
              />
            )}
          </Can>

          <span
            className="cursor-pointer hover:text-primary"
            onClick={() => setShowViewInvoiceDialog(true)}
          >
            {row.original.code}
            <br />
            {credit.length > 0 && (
              <span className="text-xs text-orange-500">
                {credit.length} HĐ điều chỉnh
              </span>
            )}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: function Cell({ row, table }) {
      const { customer, createdAt, id } = row.original
      const rows = table.getPrePaginationRowModel().rows.map((r) => r.original)

      const isDuplicate = rows.some(
        (r) =>
          r.customer.phone === customer.phone &&
          new Date(r.createdAt).getMonth() === new Date(createdAt).getMonth() &&
          new Date(r.createdAt).getFullYear() ===
          new Date(createdAt).getFullYear() &&
          r.id !== id,
      )

      return (
        <div
          className={`${isDuplicate
              ? 'flex w-40 flex-col break-words bg-yellow-200 p-2'
              : 'flex w-40 flex-col break-words'
            }`}
          title={customer.name}
        >
          <span className="font-semibold">{customer.name}</span>

          {customer.taxCode && (
            <span className="text-xs text-muted-foreground">
              MST: {customer.taxCode}
            </span>
          )}

          <span className="text-primary underline hover:text-secondary-foreground">
            <a href={`tel:${customer.phone}`}>{customer.phone}</a>
          </span>

          {row.original.note && (
            <span className="text-muted-foreground">
              <a
                target="_blank"
                className="text-primary underline hover:text-secondary-foreground"
                href={row.original.note}
                rel="noreferrer"
              >
                {row.original.note}
              </a>
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const customer = row.original.customer
      const searchableText = normalizeText(
        `${customer.name || ''} ${customer.taxCode || ''}`,
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
    accessorKey: 'sharingRatio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chia DS" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="break-words font-semibold">
          {row.original?.invoiceRevenueShare?.user?.fullName}
        </span>

        <span className="break-words font-semibold text-green-500">
          {moneyFormat(row.original?.invoiceRevenueShare?.amount || 0)}
        </span>
      </div>
    ),
    accessorFn: (row) => row.invoiceRevenueShare?.user?.id || null,
    filterFn: (row, id, value) => {
      const userId = row?.original?.invoiceRevenueShare?.user?.id
      return userId ? value.map(String).includes(String(userId)) : false
    },
    sortingFn: (rowA, rowB) => {
      const idA = rowA.original?.invoiceRevenueShare?.user?.id || 0
      const idB = rowB.original?.invoiceRevenueShare?.user?.id || 0
      return idA - idB
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'debt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Công nợ" />
    ),
    cell: ({ row }) => {
      const receipts = row.original?.receipts || []
      const debt = receipts.length > 0 ? receipts[0]?.debt : null

      if (!debt) {
        return (
          <span className="italic text-muted-foreground">
            Chưa có phiếu thu
          </span>
        )
      }

      if (debt.status === 'closed') {
        return <span className="text-green-500">Thanh toán toàn bộ</span>
      }

      const remainingAmount = moneyFormat(debt.remainingAmount)

      if (debt.paidAmount === 0) {
        return <span className="text-red-500">Còn nợ: {remainingAmount}</span>
      }

      return <span className="text-yellow-600">Còn nợ: {remainingAmount}</span>
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
      const dispatch = useDispatch()
      const [openUpdateStatus, setOpenUpdateStatus] = useState(false)
      const currentStatus = row.original.status
      const statusObj = statuses.find((s) => s.value === currentStatus)

      const handleSubmit = async (nextStatus) => {
        try {
          await dispatch(
            updateInvoiceStatus({ id: row.original.id, status: nextStatus }),
          ).unwrap()
          toast.success('Cập nhật trạng thái hóa đơn thành công')
          setOpenUpdateStatus(false)
        } catch (error) {
          console.log('Submit error: ', error)
          toast.error('Cập nhật trạng thái thất bại')
        }
      }

      return (
        <>
          {openUpdateStatus && (
            <UpdateInvoiceStatusDialog
              open={openUpdateStatus}
              onOpenChange={setOpenUpdateStatus}
              invoiceId={row.original.id}
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
    accessorKey: 'expectedDeliveryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày dự kiến giao" />
    ),
    cell: ({ row }) => {
      const deliveryDate = row.original.expectedDeliveryDate
      const status = row.original.status

      if (!deliveryDate) {
        return <span className="text-muted-foreground italic">—</span>
      }

      const date = new Date(deliveryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if overdue: date < today AND status is not delivered/paid
      const isOverdue = date < today && status !== 'delivered' && status !== 'paid'

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
