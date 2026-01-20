import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateSalesContractDialog from './CreateSalesContractDialog'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { statuses, paymentStatuses } from '../data'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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

        {table.getColumn('paymentStatus') && (
          <DataTableFacetedFilter
            column={table.getColumn('paymentStatus')}
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
        <Can permission={'CREATE_SALES_CONTRACT'}>
          <Button
            variant="default"
            size="sm"
            className="h-8"
            onClick={() => setShowCreateDialog(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Tạo hợp đồng
          </Button>

          {showCreateDialog && (
            <CreateSalesContractDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
            />
          )}
        </Can>

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
