import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon, TruckIcon } from 'lucide-react'
import ReceiptReminderDialog from './ReceiptReminderDialog'
import ExportPurchaseOrderDialog from './ExportPurchaseOrderDialog'
import { useEffect, useState } from 'react'
import CreatePurchaseOrderDialog from './CreatePurchaseOrderDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import { toast } from 'sonner'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { purchaseOrderStatuses } from '../data'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers } from '@/stores/UserSlice'

const DataTableToolbar = ({ table, isMyPurchaseOrder }) => {
  const dispatch = useDispatch()
  const isFiltered = table.getState().columnFilters.length > 0

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showReceiptReminderDialog, setShowReceiptReminderDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const users = useSelector((state) => state.user.users)

  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])



  // Handle export Excel
  const handleExportExcel = () => {
    // TODO: Implement export Excel functionality
    toast.info('Chức năng xuất Excel đang được phát triển')
  }

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

        {/* Filter theo người tạo */}
        {users && table.getColumn('user') && (
          <DataTableFacetedFilter
            column={table.getColumn('user')}
            title="Người tạo"
            options={users?.map((user) => ({
              value: user?.id,
              label: user?.fullName,
            }))}
          />
        )}

        {/* Filter theo trạng thái */}
        {purchaseOrderStatuses && table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={purchaseOrderStatuses.map((s) => ({
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
        {/* Nhắc nhở giao hàng (cho Nhà cung cấp) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const selectedRows = table.getSelectedRowModel().rows
            if (selectedRows.length === 0) {
              toast.warning('Vui lòng chọn ít nhất 1 đơn hàng')
              return
            }
            // Filter out draft/cancelled orders
            const invalidOrders = selectedRows.filter(row => ['draft', 'cancelled'].includes(row.original.status))
            if (invalidOrders.length > 0) {
              toast.warning('Chỉ có thể gửi nhắc nhở cho đơn hàng đã đặt')
              return
            }

            setShowReceiptReminderDialog(true)
          }}
        >
          <TruckIcon className="mr-2 size-4" aria-hidden="true" />
          Gửi nhắc hàng
        </Button>

        {/* Xuất Excel */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất Excel
        </Button>

        {/* Tạo đơn đặt hàng */}
        <Can permission={['CREATE_PURCHASE_ORDER']}>
          <Button
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

        {/* Dialog Export */}
        {showExportDialog && (
          <ExportPurchaseOrderDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
          />
        )}

        {/* Dialog Nhắc nhở nhận hàng */}
        {showReceiptReminderDialog && (
          <ReceiptReminderDialog
            open={showReceiptReminderDialog}
            onOpenChange={setShowReceiptReminderDialog}
            selectedPurchaseOrders={table.getSelectedRowModel().rows.map(r => r.original)}
          />
        )}



        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
