import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { warehouseReceiptStatuses } from '../data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical } from 'lucide-react'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Mobile Toolbar
  if (isMobile) {
    return (
      <div className="flex items-center gap-2 p-1">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('code')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('code')?.setFilterValue(event.target.value)
          }
          className="h-9 flex-1"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {/* We can put filters here if needed, or simplified actions */}
            {table.getColumn('status') && (
              <>
                <DropdownMenuItem disabled className="font-semibold opacity-100">
                  Trạng thái
                </DropdownMenuItem>
                {warehouseReceiptStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => table.getColumn('status')?.setFilterValue([status.value])}
                  >
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {isFiltered && (
              <>
                <div className="my-1 h-px bg-muted" />
                <DropdownMenuItem
                  onClick={() => table.resetColumnFilters()}
                  className="text-destructive focus:text-destructive"
                >
                  <Cross2Icon className="mr-2 h-4 w-4" />
                  Đặt lại
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm theo mã phiếu..."
          value={table.getColumn('code')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('code')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* Filter by status */}
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={warehouseReceiptStatuses}
          />
        )}

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
    </div>
  )
}

export { DataTableToolbar }
