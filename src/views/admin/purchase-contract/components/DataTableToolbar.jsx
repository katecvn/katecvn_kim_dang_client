import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { purchaseOrderStatuses } from '../data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  // const isMobile = useMediaQuery('(max-width: 768px)') 
  // Mobile layout in SalesContract was explicit but here we might just want responsive flex. 
  // The user asked to make it "like sales contract". Sales contract has explicit mobile check.
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Sales Contract Mobile Layout
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Search */}
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-full text-sm"
        />

        <div className="flex justify-between gap-2">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {table.getColumn('status') && (
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title="Trạng thái"
                options={purchaseOrderStatuses}
              />
            )}
          </div>

          {/* Actions - SalesContract had delivery reminder here. PurchaseContract currently has none in toolbar.
               Keeping it empty or just ViewOptions if needed, but SalesContract hid ViewOptions on mobile?
               SalesContract only had the dropdown action menu. 
           */}
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2 w-full sm:w-auto">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter ?? ''} // Changed to global filter to match Sales Contract
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={purchaseOrderStatuses}
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

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
