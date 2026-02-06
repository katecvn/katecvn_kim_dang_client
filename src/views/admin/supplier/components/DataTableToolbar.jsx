import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateSupplierDialog from './CreateSupplierDialog'
import ImportSupplierDialog from './ImportSupplierDialog'
import { FileSpreadsheet } from 'lucide-react'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateSupplierDialog, setShowCreateSupplierDialog] =
    useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('name')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
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

      <Can permission={'CREATE_SUPPLIER'}>
        <Button
          onClick={() => setShowCreateSupplierDialog(true)}
          className="mx-2 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        {showCreateSupplierDialog && (
          <CreateSupplierDialog
            open={showCreateSupplierDialog}
            onOpenChange={setShowCreateSupplierDialog}
            showTrigger={false}
          />
        )}

        <Button
          onClick={() => setShowImportDialog(true)}
          className="mx-2 bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
          Import Excel
        </Button>

        {showImportDialog && (
          <ImportSupplierDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}
      </Can>

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
