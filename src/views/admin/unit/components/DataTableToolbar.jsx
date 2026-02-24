import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateUnitDialog from './CreateUnitDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import ExportUnitDialog from './ExportUnitDialog'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateUnitDialog, setShowCreateUnitDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

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

      <Can permission={'CREATE_CATEGORY'}>
        <Button
          onClick={() => setShowCreateUnitDialog(true)}
          className="mx-2 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        {showCreateUnitDialog && (
          <CreateUnitDialog
            open={showCreateUnitDialog}
            onOpenChange={setShowCreateUnitDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <Can permission={'GET_UNIT'}>
        <Button
          onClick={() => setShowExportDialog(true)}
          className="mx-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
          variant="outline"
          size="sm"
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất Excel
        </Button>

        {showExportDialog && (
          <ExportUnitDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
