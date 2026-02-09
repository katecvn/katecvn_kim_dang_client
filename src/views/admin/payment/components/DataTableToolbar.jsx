import { Cross2Icon } from '@radix-ui/react-icons'
import { useState } from 'react'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import DeleteMultiplePaymentsDialog from './DeleteMultiplePaymentsDialog'
import {
  TrashIcon,
} from '@radix-ui/react-icons'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-0 sm:p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm theo mã phiếu chi..."
          value={table.getColumn('code')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('code')?.setFilterValue(event.target.value)
          }
          className="h-8 flex-1 lg:flex-none lg:w-[250px]"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Đặt lại
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />

      {selectedRows.length > 0 && (
        <>
          <Button
            variant="destructive"
            size="sm"
            className="ml-2 h-8 px-2 lg:px-3"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Xóa ({selectedRows.length})
          </Button>

          <DeleteMultiplePaymentsDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            payments={selectedRows.map((row) => row.original)}
            onSuccess={() => {
              table.toggleAllPageRowsSelected(false)
              setShowDeleteDialog(false)
            }}
            contentClassName="z-[100060]"
            overlayClassName="z-[100059]"
          />
        </>
      )}
    </div>
  )
}

export { DataTableToolbar }
