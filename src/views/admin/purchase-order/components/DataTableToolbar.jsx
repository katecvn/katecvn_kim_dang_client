
import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon, TruckIcon, EllipsisVertical } from 'lucide-react'
import ReceiptReminderDialog from './ReceiptReminderDialog'
import ExportPurchaseOrderDialog from './ExportPurchaseOrderDialog'
import { useEffect, useState } from 'react'
import PurchaseOrderDialog from './PurchaseOrderDialog'
import ImportPurchaseOrderDialog from './ImportPurchaseOrderDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { purchaseOrderStatuses } from '../data'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers } from '@/stores/UserSlice'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const DataTableToolbar = ({ table, onCreated, isMyPurchaseOrder }) => {
  const dispatch = useDispatch()
  const isFiltered = table.getState().columnFilters.length > 0

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showReceiptReminderDialog, setShowReceiptReminderDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const users = useSelector((state) => state.user.users)

  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  // Handle export Excel
  const handleExportExcel = () => {
    toast.info('Chức năng xuất Excel đang được phát triển')
  }

  // Mobile Toolbar
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Search section */}
        <Input
          placeholder="Tìm theo Mã ĐĐH, Tên NCC, SĐT, MST"
          value={table.getState().globalFilter || ''}
          onChange={(e) =>
            table.setGlobalFilter(e.target.value)
          }
          className="h-8 w-full text-sm"
        />

        {/* Quick actions */}
        <div className="flex gap-2">
          <Can permission={['CREATE_PURCHASE_ORDER']}>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <PlusIcon className="mr-1 h-3 w-3" />
              Thêm
            </Button>
          </Can>

          {/* Menu button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setShowExportDialog(true)}
                className="text-xs"
              >
                <IconFileTypeXls className="mr-2 h-3 w-3" />
                Xuất file Excel
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShowImportDialog(true)}
                className="text-xs"
              >
                <FileSpreadsheet className="mr-2 h-3 w-3" />
                Import Excel
              </DropdownMenuItem>

              {/* Nhắc nhở giao hàng */}
              <DropdownMenuItem
                onClick={() => {
                  const selectedRows = table.getSelectedRowModel().rows
                  if (selectedRows.length === 0) {
                    toast.warning('Vui lòng chọn ít nhất 1 đơn hàng')
                    return
                  }
                  const invalidOrders = selectedRows.filter(row => ['draft', 'cancelled'].includes(row.original.status))
                  if (invalidOrders.length > 0) {
                    toast.warning('Chỉ có thể gửi nhắc nhở cho đơn hàng đã đặt')
                    return
                  }
                  setShowReceiptReminderDialog(true)
                }}
                className="text-xs"
              >
                <TruckIcon className="mr-2 h-3 w-3" />
                Gửi nhắc hàng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialog tạo đơn đặt hàng */}
        {showCreateDialog && (
          <PurchaseOrderDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={onCreated}
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

        {/* Dialog Import */}
        {showImportDialog && (
          <ImportPurchaseOrderDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}
      </div>
    )
  }

  // Desktop Toolbar
  return (
    <div
      className="
    flex w-full justify-between gap-3 overflow-x-auto
    p-1
    md:flex-wrap md:overflow-visible
  "
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
          <Input
            placeholder="Tìm theo Mã ĐĐH, Tên NCC, SĐT, MST"
            value={table.getState().globalFilter || ''}
            onChange={(e) =>
              table.setGlobalFilter(e.target.value)
            }
            className="h-8 w-full sm:w-[350px]"
          />
        </div>

        {/* Filter theo người tạo */}
        {users && table.getColumn('createdByUser') && (
          <DataTableFacetedFilter
            column={table.getColumn('createdByUser')}
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

        {/* Import Excel */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportDialog(true)}
        >
          <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
          Import Excel
        </Button>

        {/* Tạo đơn đặt hàng */}
        <Can permission={['CREATE_PURCHASE_ORDER']}>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </Can>

        {/* Dialog tạo đơn đặt hàng */}
        {showCreateDialog && (
          <PurchaseOrderDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={onCreated}
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

        {/* Dialog Import */}
        {showImportDialog && (
          <ImportPurchaseOrderDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
