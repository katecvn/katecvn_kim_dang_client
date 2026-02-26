import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateTaxDialog from './CreateTaxDialog'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateTaxDialog, setShowCreateTaxDialog] = useState(false)

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2 w-full">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('title')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px] flex-1"
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

      <Can permission={'CREATE_TAX'}>
        <Button
          onClick={() => setShowCreateTaxDialog(true)}
          className="bg-green-600 hover:bg-green-700 text-white shrink-0"
          size="sm"
        >
          <PlusIcon className="mr-1 sm:mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        {showCreateTaxDialog && (
          <CreateTaxDialog
            open={showCreateTaxDialog}
            onOpenChange={setShowCreateTaxDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
