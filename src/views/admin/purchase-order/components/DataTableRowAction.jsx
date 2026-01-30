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
  IconCircleX,
  IconPrinter,
  IconFileText,
  IconPackageImport,
  IconCreditCard,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeletePurchaseOrderDialog from './DeletePurchaseOrderDialog'
import UpdatePurchaseOrderDialog from './UpdatePurchaseOrderDialog'
import ViewPurchaseOrderDialog from './ViewPurchaseOrderDialog'
import UpdatePurchaseOrderStatusDialog from './UpdatePurchaseOrderStatusDialog'
import { useDispatch, useSelector } from 'react-redux'
import { updatePurchaseOrderStatus } from '@/stores/PurchaseOrderSlice'
import { createWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { purchaseOrderStatuses } from '../data'
import { toast } from 'sonner'
import PurchaseContractPreviewDialog from './PurchaseContractPreviewDialog'
import { buildPurchaseContractData } from '../helpers/BuildPurchaseContractData'
import ConfirmImportWarehouseDialog from './ConfirmImportWarehouseDialog'
import CreatePurchaseOrderPaymentDialog from './CreatePurchaseOrderPaymentDialog'
import PrintPurchaseOrderView from './PrintPurchaseOrderView'

const DataTableRowActions = ({ row }) => {
  const purchaseOrder = row?.original || {}
  const setting = useSelector((state) => state.setting.setting)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

  // New States
  const [showContractPreview, setShowContractPreview] = useState(false)
  const [contractPreviewData, setContractPreviewData] = useState(null)
  const [showImportWarehouseDialog, setShowImportWarehouseDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showPrintOrder, setShowPrintOrder] = useState(false)

  const dispatch = useDispatch()

  const handleUpdateStatus = async (status, id) => {
    try {
      await dispatch(updatePurchaseOrderStatus({ id, status })).unwrap()
      toast.success('Cập nhật trạng thái thành công')
      setShowUpdateStatusDialog(false)
    } catch (error) {
      // Error handled in slice/toast
    }
  }

  const handlePrintContract = () => {
    const contract = buildPurchaseContractData(purchaseOrder, purchaseOrder.purchaseContract?.code || purchaseOrder.externalOrderCode || '')
    setContractPreviewData(contract)
    setShowContractPreview(true)
  }

  const handleCreateWarehouseReceipt = async (selectedIds) => {
    const selectedItems = purchaseOrder.items.filter(item => selectedIds.includes(String(item.id)) || selectedIds.includes(item.id))

    // Construct payload strictly matching Create Warehouse Receipt Structure
    const payload = {
      type: 'import',
      supplierId: purchaseOrder.supplierId,
      referenceId: purchaseOrder.id,
      referenceType: 'purchase_order',
      note: `Nhập kho từ đơn hàng ${purchaseOrder.code}`,
      status: 'draft',
      orderDate: new Date().toISOString(),
      items: selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitId: item.unitId,
        unitPrice: item.unitPrice,
        conversionFactor: item.conversionFactor || 1,
        // Ensure other required fields if strictly validated
      }))
    }

    try {
      await dispatch(createWarehouseReceipt(payload)).unwrap()
      // toast.success handled in slice
    } catch (error) {
      console.error(error)
    }
  }

  const canEdit = purchaseOrder?.status === 'draft'
  const canDelete = purchaseOrder?.status === 'draft'
  const canCancel = !['draft', 'cancelled'].includes(purchaseOrder?.status)

  const canImportWarehouse = ['ordered', 'confirmed', 'partial'].includes(purchaseOrder?.status)
  const canPayment = !['draft', 'cancelled'].includes(purchaseOrder?.status) && purchaseOrder.paymentStatus !== 'paid'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <Can permission="GET_PURCHASE_ORDER">
            <DropdownMenuItem onClick={() => setShowViewDialog(true)} className="text-slate-600">
              Xem chi tiết
              <DropdownMenuShortcut>
                <IconEye className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowPrintOrder(true)}>
            In đơn hàng
            <DropdownMenuShortcut>
              <IconPrinter className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePrintContract}>
            In hợp đồng
            <DropdownMenuShortcut>
              <IconFileText className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canImportWarehouse && (
            <Can permission="CREATE_WAREHOUSE_RECEIPT">
              <DropdownMenuItem onClick={() => setShowImportWarehouseDialog(true)}>
                Tạo phiếu nhập
                <DropdownMenuShortcut>
                  <IconPackageImport className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {canPayment && (
            <Can permission="CREATE_PAYMENT">
              <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
                Tạo phiếu chi
                <DropdownMenuShortcut>
                  <IconCreditCard className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuSeparator />

          {canEdit && (
            <Can permission="UPDATE_PURCHASE_ORDER">
              <DropdownMenuItem onClick={() => setShowUpdateDialog(true)} className="text-blue-600">
                Sửa
                <DropdownMenuShortcut>
                  <IconPencil className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {canCancel && (
            <Can permission="UPDATE_PURCHASE_ORDER">
              <DropdownMenuItem onClick={() => setShowUpdateStatusDialog(true)} className="text-red-600">
                Hủy
                <DropdownMenuShortcut>
                  <IconCircleX className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {canDelete && (
            <Can permission="DELETE_PURCHASE_ORDER">
              <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className="text-red-600">
                Xóa
                <DropdownMenuShortcut>
                  <IconTrash className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      {showDeleteDialog && (
        <DeletePurchaseOrderDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          purchaseOrder={purchaseOrder}
          showTrigger={false}
        />
      )}

      {showUpdateDialog && (
        <UpdatePurchaseOrderDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          purchaseOrderId={purchaseOrder.id}
          showTrigger={false}
        />
      )}

      {showViewDialog && (
        <ViewPurchaseOrderDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          purchaseOrderId={purchaseOrder.id}
          showTrigger={false}
        />
      )}

      {showUpdateStatusDialog && (
        <UpdatePurchaseOrderStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          purchaseOrderId={purchaseOrder.id}
          currentStatus={purchaseOrder.status}
          statuses={purchaseOrderStatuses}
          onSubmit={handleUpdateStatus}
        />
      )}

      {/* New Dialogs */}
      {showContractPreview && contractPreviewData && (
        <PurchaseContractPreviewDialog
          open={showContractPreview}
          onOpenChange={setShowContractPreview}
          data={contractPreviewData}
        />
      )}

      {showImportWarehouseDialog && (
        <ConfirmImportWarehouseDialog
          open={showImportWarehouseDialog}
          onOpenChange={setShowImportWarehouseDialog}
          purchaseOrder={purchaseOrder}
          onConfirm={handleCreateWarehouseReceipt}
        />
      )}

      {showPaymentDialog && (
        <CreatePurchaseOrderPaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          purchaseOrder={purchaseOrder}
          showTrigger={false}
        />
      )}

      {showPrintOrder && (
        <PrintPurchaseOrderView
          purchaseOrder={purchaseOrder}
          setting={setting}
          onAfterPrint={() => setShowPrintOrder(false)}
        />
      )}
    </>
  )
}

export { DataTableRowActions }
