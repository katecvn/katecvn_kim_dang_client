import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreatePurchaseOrderDialog from './CreatePurchaseOrderDialog'
import { IconFileTypePdf } from '@tabler/icons-react'
import { toast } from 'sonner'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { statuses } from '../data'

const DataTableToolbar = ({ table, isMyPurchaseOrder }) => {
  const isFiltered = table.getState().columnFilters.length > 0

  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <div
      className="
    flex w-full justify-between gap-3 overflow-x-auto
    p-1
    md:flex-wrap md:overflow-visible
  "
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="flex items-center justify-center gap-1">
          <Input
            placeholder="Tìm theo mã ĐĐH"
            value={table.getColumn('code')?.getFilterValue() || ''}
            onChange={(e) =>
              table.getColumn('code')?.setFilterValue(e.target.value)
            }
            className="h-8 w-[100px] lg:w-[160px]"
          />
          <Input
            placeholder="Tìm theo NCC"
            value={table.getColumn('supplier')?.getFilterValue() || ''}
            onChange={(event) =>
              table.getColumn('supplier')?.setFilterValue(event.target.value)
            }
            className="h-8 w-[100px] lg:w-[200px]"
          />
        </div>

        {statuses && table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={statuses.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
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

      <div className="flex flex-wrap items-center justify-end gap-2 whitespace-nowrap">
        {/* Tạo đơn đặt hàng */}
        <Can permission={['CREATE_PURCHASE_ORDER']}>
          <Button
            className=""
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </Can>

        {/* Dialog tạo đơn đặt hàng */}
        {showCreateDialog && (
          <CreatePurchaseOrderDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            showTrigger={false}
          />
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
