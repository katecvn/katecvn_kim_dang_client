import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateCustomerDialog from './CreateCustomerDialog'
import ImportCustomerDialog from './ImportCustomerDialog'
import { types } from '../data'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm tên, SĐT..."
          value={table.getState().globalFilter || ''}
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <div className="flex gap-x-2">
          {table.getColumn('type') && (
            <DataTableFacetedFilter
              column={table.getColumn('type')}
              title="Loại khách hàng"
              options={types}
            />
          )}
        </div>

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

      <Can permission={'CREATE_CUSTOMER'}>
        <Button
          onClick={() => setShowCreateCustomerDialog(true)}
          className="mx-2 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        <Button
          onClick={() => setShowImportDialog(true)}
          className="mx-2"
          variant="outline"
          size="sm"
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Import Excel
        </Button>

        {showImportDialog && (
          <ImportCustomerDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}

        {showCreateCustomerDialog && (
          <CreateCustomerDialog
            open={showCreateCustomerDialog}
            onOpenChange={setShowCreateCustomerDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
