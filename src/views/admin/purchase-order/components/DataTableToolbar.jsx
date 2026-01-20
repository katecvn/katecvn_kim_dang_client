import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import CreatePurchaseOrderDialog from './CreatePurchaseOrderDialog'
import { IconFileTypePdf, IconFileTypeXls, IconPackage } from '@tabler/icons-react'
import { toast } from 'sonner'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { statuses } from '../data'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers } from '@/stores/UserSlice'

const DataTableToolbar = ({ table, isMyPurchaseOrder }) => {
  const dispatch = useDispatch()
  const isFiltered = table.getState().columnFilters.length > 0

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showCreateReceiptDialog, setShowCreateReceiptDialog] = useState(false)
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null)

  const users = useSelector((state) => state.user.users)

  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  // Handle create receipt from PO
  const handleShowCreateReceiptDialog = () => {
    const selectedRows = table.getSelectedRowModel().rows

    if (selectedRows.length !== 1) {
      toast.warning('Vui lòng chọn 1 (Một) đơn đặt hàng')
      return
    }

    const po = selectedRows[0].original

    // Check if PO is approved or partial
    if (po.status !== 'approved' && po.status !== 'partial') {
      toast.warning('Chỉ có thể tạo phiếu nhập kho từ đơn đã duyệt')
      return
    }

    setSelectedPurchaseOrder(po)
    setShowCreateReceiptDialog(true)
  }

  // Handle print PO
  const handlePrintPO = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length !== 1) {
      toast.warning('Vui lòng chọn 1 (Một) đơn đặt hàng để in')
      return
    }
    // TODO: Implement print PO functionality
    toast.info('Chức năng in đơn đặt hàng đang được phát triển')
  }

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
        {/* Xuất Excel */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất Excel
        </Button>

        {/* In đơn đặt hàng */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrintPO}
        >
          <IconFileTypePdf className="mr-2 size-4" aria-hidden="true" />
          In ĐĐH
        </Button>

        {/* Tạo phiếu nhập kho từ PO */}
        <Can permission={['CREATE_RECEIPT']}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowCreateReceiptDialog}
          >
            <IconPackage className="mr-2 size-4" aria-hidden="true" />
            Tạo phiếu nhập
          </Button>
        </Can>

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

        {/* Dialog tạo phiếu nhập kho (TODO: Implement) */}
        {showCreateReceiptDialog && selectedPurchaseOrder && (
          <div>
            {/* TODO: Tạo CreateReceiptFromPODialog component */}
            {/* <CreateReceiptFromPODialog
              purchaseOrder={selectedPurchaseOrder}
              open={showCreateReceiptDialog}
              onOpenChange={setShowCreateReceiptDialog}
              showTrigger={false}
            /> */}
          </div>
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
