import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader'
import { useState } from 'react'
import ExpiryDetailDialog from './ExpiryDetailDialog'
import { dateFormat } from '@/utils/date-format'
import { DataTableRowActions } from './DataTableRowAction'
import RenderEndDateWithText from './RenderEndDateWithText'
// import ViewInvoiceDialog from '../../invoice/components/ViewInvoiceDialog'
import CreateInvoiceWithExpiryDialog from './CreateInvoiceWithExpiryDialog'
import { Button } from '@/components/ui/button'
import { isValid } from 'date-fns'
import { IconReceiptDollar } from '@tabler/icons-react'

export const columns = [
  {
    accessorKey: 'index',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => <div className="">{row.index + 1}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'accountName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên tài khoản" />
    ),
    cell: function Cell({ row }) {
      const [showExpiryDetailDialog, setShowExpiryDetailDialog] =
        useState(false)
      const accountName = row.getValue('accountName')
      return (
        <div>
          <div
            className="flex w-40 cursor-pointer items-center"
            title={accountName}
            onClick={() => setShowExpiryDetailDialog(true)}
          >
            <span className="truncate whitespace-normal break-words text-sm text-primary hover:underline">
              {accountName}
            </span>
          </div>
          {showExpiryDetailDialog && (
            <ExpiryDetailDialog
              open={showExpiryDetailDialog}
              onOpenChange={setShowExpiryDetailDialog}
              account={row.original}
              showTrigger={false}
            />
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: function Cell({ row }) {
      const customerName = row.original.customer?.name
      const customerPhone = row.original.customer?.phone
      return (
        <div>
          <div
            className="flex w-40 items-center"
            title={row.getValue('customer')}
          >
            <span className="truncate whitespace-normal break-words text-sm">
              {customerName}
              <a href={`tel:${customerPhone}`}>
                <p className="truncate whitespace-normal text-sm text-primary">
                  {`${customerPhone}`}
                </p>
              </a>
            </span>
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhân viên" />
    ),
    accessorFn: (row) => row?.expiries[0]?.userId,
    filterFn: (row, columnId, filterValue) => {
      const userId = row.original.expiries?.[0]?.userId
      return filterValue.includes(userId)
    },
    cell: function Cell({ row }) {
      const userFullName = row.original.expiries[0]?.user?.fullName
      return (
        <div>
          <div
            className="flex w-32 items-center"
            title={row.getValue('userId')}
          >
            {userFullName ? (
              <span className="truncate whitespace-normal break-words text-sm">
                {userFullName}
              </span>
            ) : (
              <span className="text-muted-foreground">Không có</span>
            )}
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'product',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sản phẩm" />
    ),
    accessorFn: (row) => row?.expiries?.[0]?.productId,
    filterFn: (row, columnId, filterValue) => {
      const product = row.original.expiries?.[0]?.productId
      return filterValue.includes(product)
    },
    cell: ({ row }) => {
      const product = row.original.expiries[0]?.product

      return (
        <div className="flex w-32 space-x-2">
          {product ? (
            <span className={`w-18 truncate text-start`}>{product?.name}</span>
          ) : (
            <span className="text-muted-foreground">Không có</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'accountCreatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo hạn" />
    ),
    cell: ({ row }) => {
      const accountCreatedDate = dateFormat(row.original.accountCreatedAt)

      if (!accountCreatedDate) {
        return null
      }

      return (
        <div className="flex w-28 items-center">
          <span>{accountCreatedDate}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'startDate',
    accessorFn: (row) => row.expiries?.[0]?.startDate,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày gia hạn" />
    ),
    cell: ({ row }) => {
      const startDateFromApi = row.original.expiries[0]?.startDate

      const parsedDate = startDateFromApi ? new Date(startDateFromApi) : null

      if (!parsedDate || !isValid(parsedDate)) {
        return (
          <div className="flex w-28 items-center">
            <span className="text-muted-foreground">Không có</span>
          </div>
        )
      }

      const startDate = dateFormat(parsedDate)

      return (
        <div className="flex w-28 items-center">
          <span>{startDate}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'endDate',
    accessorFn: (row) => row.expiries?.[0]?.endDate,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày hết hạn" />
    ),
    cell: ({ row }) => {
      const endDateFromApi = row.original.expiries[0]?.endDate
      const parsedDate = endDateFromApi ? new Date(endDateFromApi) : null
      if (!parsedDate || !isValid(parsedDate)) {
        return (
          <div className="flex w-28 items-center">
            <span className="text-muted-foreground">Không có</span>
          </div>
        )
      }
      const startDateFromApi = row.original.expiries[0]?.startDate
      const endDate = new Date(endDateFromApi)
      const startDate = new Date(startDateFromApi)
      const stepDate = row.original.expiries[0]?.alertDateStep

      return (
        <>
          <div className="space-x-2">
            <RenderEndDateWithText
              endDateFromApi={endDate}
              stepDate={stepDate}
              startDate={startDate}
            />
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'expiry',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gia hạn" />
    ),
    accessorFn: (row) => row?.expiries?.[0]?.category,
    filterFn: (row, columnId, filterValue) => {
      const category = row.original.expiries?.[0]?.category
      return filterValue.includes(category)
    },
    cell: ({ row }) => {
      const [
        showCreateInvoiceWithExpiryDialog,
        setShowCreateInvoiceWithExpiryDialog,
      ] = useState(false)
      return (
        <>
          <Button
            onClick={() => setShowCreateInvoiceWithExpiryDialog(true)}
            className={`flex h-6 w-24 items-center truncate text-start`}
          >
            <IconReceiptDollar size={14} className="mr-1" />
            Gia hạn
          </Button>
          {showCreateInvoiceWithExpiryDialog && (
            <CreateInvoiceWithExpiryDialog
              type={'digital'}
              open={showCreateInvoiceWithExpiryDialog}
              onOpenChange={setShowCreateInvoiceWithExpiryDialog}
              showTrigger={false}
              accountData={row.original}
            />
          )}
        </>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableGlobalFilter: false,
  },
]
