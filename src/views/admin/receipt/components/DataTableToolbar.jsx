import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import PaymentReminderDialog from './PaymentReminderDialog'
import { useState } from 'react'
import { BellIcon } from 'lucide-react'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getSelectedRowModel().rows
  const [openReminder, setOpenReminder] = useState(false)
  const canRemind = selectedRows.length === 1

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('customer')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('customer')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
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

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!canRemind}
          onClick={() => setOpenReminder(true)}
        >
          <BellIcon className="mr-2 h-4 w-4" />
          Nhắc hạn thanh toán
        </Button>
      </div>

      {canRemind && (
        <PaymentReminderDialog
          open={openReminder}
          onOpenChange={setOpenReminder}
          receipt={selectedRows[0].original}
        />
      )}

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
