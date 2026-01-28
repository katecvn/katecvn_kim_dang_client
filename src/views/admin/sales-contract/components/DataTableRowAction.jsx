import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  IconEye,
  IconPencil,
  IconTrash,
  IconFileInvoice,
  IconPackageExport,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeleteSalesContractDialog from './DeleteSalesContractDialog'
import UpdateSalesContractDialog from './UpdateSalesContractDialog'
import ViewSalesContractDialog from './ViewSalesContractDialog'
import { useDispatch } from 'react-redux'
import { generateWarehouseReceiptFromInvoice } from '@/stores/WarehouseReceiptSlice'
import { toast } from 'sonner'
import { getSalesContracts } from '@/stores/SalesContractSlice'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'

const DataTableRowActions = ({ row }) => {
  const contract = row?.original || {}
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

  // Kiểm tra xem có thể sửa không dựa vào status
  // Chỉ có thể sửa khi status = 'draft' (Đang chờ)
  const canEdit = contract.status === 'draft'

  // Chỉ có thể xóa khi status = 'draft' (Đang chờ)
  const canDelete = contract.status === 'draft'

  const dispatch = useDispatch()
  const [warehouseLoading, setWarehouseLoading] = useState(false)
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)

  const handleCreateWarehouseReceipt = async () => {
    // Logic to find the first invoice ID
    const firstInvoice = contract.invoices?.[0]
    if (!firstInvoice) {
      toast.warning('Hợp đồng này chưa có hóa đơn')
      return
    }

    if (firstInvoice.warehouseReceipts?.length > 0) {
      toast.warning('Hóa đơn này đã có phiếu xuất kho')
      return
    }

    // Show confirmation dialog instead of creating immediately
    setShowConfirmWarehouseDialog(true)
  }

  const handleConfirmCreateWarehouseReceipt = async (selectedItemIds) => {
    const firstInvoice = contract.invoices?.[0]
    if (!firstInvoice) return

    try {
      setWarehouseLoading(true)
      const data = await dispatch(
        generateWarehouseReceiptFromInvoice({
          invoiceId: firstInvoice.id,
          type: 'contract',
          selectedItemIds,
        })
      ).unwrap()

      toast.success(`Đã tạo phiếu xuất kho ${data?.code || 'thành công'}`)

      // Refresh list
      await dispatch(getSalesContracts({})).unwrap()
    } catch (error) {
      console.error('Create warehouse receipt error:', error)
    } finally {
      setWarehouseLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <Can permission={'GET_SALES_CONTRACT'}>
            <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
              Xem
              <DropdownMenuShortcut>
                <IconEye className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission={'UPDATE_SALES_CONTRACT'}>
            <DropdownMenuItem
              onClick={() => setShowUpdateDialog(true)}
              className={`text-blue-600 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canEdit}
            >
              Sửa
              <DropdownMenuShortcut>
                <IconPencil className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission={'CREATE_INVOICE'}>
            <DropdownMenuItem
              onClick={handleCreateWarehouseReceipt}
              disabled={warehouseLoading || !contract.invoices?.[0] || contract.invoices?.[0]?.warehouseReceipts?.length > 0}
              className="text-blue-600"
            >
              Tạo phiếu xuất kho
              <DropdownMenuShortcut>
                <IconPackageExport className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <DropdownMenuSeparator />

          <Can permission={'DELETE_SALES_CONTRACT'}>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className={`text-red-600 ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canDelete}
            >
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      {showViewDialog && (
        <ViewSalesContractDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          contractId={contract.id}
        />
      )}

      {showUpdateDialog && canEdit && (
        <UpdateSalesContractDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          contractId={contract.id}
        />
      )}

      {showDeleteDialog && canDelete && (
        <DeleteSalesContractDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          contractId={contract.id}
        />
      )}

      {/* Confirm Warehouse Receipt Dialog */}
      {showConfirmWarehouseDialog && (
        <ConfirmWarehouseReceiptDialog
          open={showConfirmWarehouseDialog}
          onOpenChange={setShowConfirmWarehouseDialog}
          invoice={contract.invoices?.[0]}
          onConfirm={handleConfirmCreateWarehouseReceipt}
          loading={warehouseLoading}
        />
      )}
    </>
  )
}

export { DataTableRowActions }
