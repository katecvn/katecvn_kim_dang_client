import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { purchaseContractStatuses } from '../data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { TruckIcon, EllipsisVertical } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import ContractReminderDialog from './ContractReminderDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  // const isMobile = useMediaQuery('(max-width: 768px)') 
  // Mobile layout in SalesContract was explicit but here we might just want responsive flex. 
  // The user asked to make it "like sales contract". Sales contract has explicit mobile check.
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [showReminderDialog, setShowReminderDialog] = useState(false)

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
                options={purchaseContractStatuses}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    const selectedRows = table.getSelectedRowModel().rows
                    if (selectedRows.length === 0) {
                      toast.warning('Vui lòng chọn ít nhất 1 hợp đồng')
                      return
                    }
                    setShowReminderDialog(true)
                  }}
                  className="text-xs"
                >
                  <TruckIcon className="mr-2 h-3 w-3" />
                  Gửi nhắc hàng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {showReminderDialog && (
              <ContractReminderDialog
                open={showReminderDialog}
                onOpenChange={setShowReminderDialog}
                selectedContracts={table.getSelectedRowModel().rows.map(r => r.original)}
              />
            )}
          </div>
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
            options={purchaseContractStatuses}
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const selectedRows = table.getSelectedRowModel().rows
            if (selectedRows.length === 0) {
              toast.warning('Vui lòng chọn ít nhất 1 hợp đồng')
              return
            }
            setShowReminderDialog(true)
          }}
        >
          <TruckIcon className="mr-2 size-4" aria-hidden="true" />
          Gửi nhắc hàng
        </Button>
        <DataTableViewOptions table={table} />

        {showReminderDialog && (
          <ContractReminderDialog
            open={showReminderDialog}
            onOpenChange={setShowReminderDialog}
            selectedContracts={table.getSelectedRowModel().rows.map(r => r.original)}
          />
        )}
      </div>
    </div>
  )
}

export { DataTableToolbar }
