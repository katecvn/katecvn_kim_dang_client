import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { TruckIcon } from 'lucide-react'
import { useState } from 'react'
import DeliveryReminderDialog from '../../invoice/components/DeliveryReminderDialog'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { statuses, paymentStatuses } from '../data'
import { toast } from 'sonner'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showDeliveryReminderDialog, setShowDeliveryReminderDialog] = useState(false)

  const handleShowDeliveryReminderDialog = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 hợp đồng')
      return
    }

    setShowDeliveryReminderDialog(true)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={statuses}
          />
        )}

        {table.getColumn('invoices') && (
          <DataTableFacetedFilter
            column={table.getColumn('invoices')}
            title="Thanh toán"
            options={paymentStatuses}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Gửi nhắc giao hàng */}
        <Button
          className=""
          variant="outline"
          size="sm"
          onClick={handleShowDeliveryReminderDialog}
        >
          <TruckIcon className="mr-2 size-4" aria-hidden="true" />
          Gửi nhắc giao hàng
        </Button>

        {showDeliveryReminderDialog && (
          <DeliveryReminderDialog
            open={showDeliveryReminderDialog}
            onOpenChange={setShowDeliveryReminderDialog}
            selectedInvoices={table.getSelectedRowModel().rows.flatMap(row => 
              row.original.invoices.map(inv => ({
                ...inv,
                customer: row.original.customer,
                amount: inv.totalAmount,
                salesContract: row.original
              }))
            )}
          />
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
