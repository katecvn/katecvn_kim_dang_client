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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  IconEye,
  IconPencil,
  IconTrash,
  IconReceiptRefund,
  IconFileTypeDocx,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeletePurchaseContractDialog from './DeletePurchaseContractDialog'
import UpdatePurchaseContractDialog from './UpdatePurchaseContractDialog'
import ViewPurchaseContractDialog from './ViewPurchaseContractDialog'
import LiquidatePurchaseContractDialog from './LiquidatePurchaseContractDialog'
import ConfirmImportWarehouseDialog from '@/views/admin/warehouse-receipt/components/ConfirmImportWarehouseDialog'
import { createWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { useDispatch } from 'react-redux'
import { getPurchaseContracts, getPurchaseContractDetail, cancelLiquidatePurchaseContract } from '@/stores/PurchaseContractSlice'
import { toast } from 'sonner'
import { IconPackageImport } from '@tabler/icons-react'
import { CreditCard, Printer } from 'lucide-react'
import PaymentFormDialog from '../../payment/components/PaymentDialog'
import PurchaseContractPreviewDialog from './PurchaseContractPreviewDialog'
import { buildPurchaseContractData } from '../helpers/BuildPurchaseContractData'
import { exportPurchaseContractWord } from '../helpers/ExportPurchaseContractWord'

const DataTableRowActions = ({ row }) => {
  const contract = row?.original || {}
  const dispatch = useDispatch()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showLiquidationDialog, setShowLiquidationDialog] = useState(false)
  const [showCancelLiquidateConfirm, setShowCancelLiquidateConfirm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCreatePaymentDialog, setShowCreatePaymentDialog] = useState(false)
  const [fullContract, setFullContract] = useState(null)

  // Print contract state
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong.docx')
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentExporting, setInstallmentExporting] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)

  // Có customerId => hợp đồng của khách hàng
  const isCustomerContract = !!contract?.customerId

  // Check if editable based on status
  const canEdit = contract.status === 'draft'
  const canDelete = contract.status === 'draft'
  const canLiquidate = contract.status === 'confirmed' // Only confirmed contracts can be liquidated
  const canImport = contract.status === 'confirmed' || contract.status === 'shipping'
  const canCreatePayment = ['ordered', 'partial', 'completed'].includes(contract?.purchaseOrders?.[0]?.status)

  const handleCreatePaymentClick = async () => {
    try {
      const contractDetail = await dispatch(getPurchaseContractDetail(contract.id)).unwrap()

      const totalAmount = parseFloat(contractDetail?.totalAmount || 0)
      const paidAmount = parseFloat(contractDetail?.paidAmount || 0)
      const pendingAmount = (contractDetail?.paymentVouchers || contractDetail?.payments || [])
        .filter(p => p.status === 'pending' || p.status === 'draft')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)

      const remainingAmount = Math.max(0, totalAmount - paidAmount - pendingAmount)

      if (remainingAmount <= 0) {
        toast.error('Hợp đồng đã thanh toán đủ hoặc đang có phiếu chi nháp/chờ duyệt chờ xử lý hết số nợ.')
        return
      }

      setFullContract(contractDetail)
      setShowCreatePaymentDialog(true)
    } catch (error) {
      console.error('Fetch contract detail error:', error)
      toast.error('Không thể lấy thông tin chi tiết hợp đồng')
    }
  }

  const handleImportWarehouse = async () => {
    try {
      const contractDetail = await dispatch(getPurchaseContractDetail(contract.id)).unwrap()

      const firstPO = contractDetail?.purchaseOrders?.[0]
      const hasCompletedPayment = firstPO?.paymentVouchers?.some(
        (voucher) => voucher.status === 'completed'
      ) || contractDetail?.paymentVouchers?.some(
        (voucher) => voucher.status === 'completed'
      ) || contract?.paymentStatus === 'partial' || contract?.paymentStatus === 'paid'

      if (!hasCompletedPayment) {
        toast.warning('Hợp đồng mua hàng phải có ít nhất một phiếu chi đã ghi sổ (đã chi) mới được tạo phiếu nhập kho')
        return
      }

      setShowImportDialog(true)
    } catch (error) {
      console.error('Fetch contract detail error:', error)
      toast.error('Không thể lấy chi tiết hợp đồng')
    }
  }

  const handlePrintContract = async () => {
    try {
      setPrintLoading(true)
      const contractDetail = await dispatch(getPurchaseContractDetail(contract.id)).unwrap()
      const data = buildPurchaseContractData(contractDetail)
      setInstallmentData(data)
      setInstallmentFileName(`hop-dong-mua-hang-${contractDetail.code || 'contract'}.docx`)
      setShowInstallmentPreview(true)
    } catch (error) {
      console.error('Load purchase contract data error:', error)
      toast.error('Không lấy được dữ liệu hợp đồng')
    } finally {
      setPrintLoading(false)
    }
  }

  const handleCreateWarehouseReceipt = async (selectedItems) => {
    const payload = {
      // code: `NK-${contract.code}-${Date.now().toString().slice(-4)}`,
      receiptType: 1, // IMPORT
      businessType: 'purchase_in',

      reason: `Nhập kho theo hợp đồng ${contract.code}`,
      note: contract.note || '',
      warehouseId: null,
      supplierId: contract.supplierId,
      purchaseContractId: contract.id,
      details: selectedItems.map(item => ({
        productId: item.productId || item.product?.id,
        unitId: item.unitId || item.unit?.id,
        movement: 'in',
        qtyActual: item.quantity,
        unitPrice: item.unitPrice || 0,
        content: `Nhập kho theo hợp đồng ${contract.code}`,
        purchaseContractId: contract.id,
        // If item comes from a PO (has purchaseOrderId), link to it
        purchaseOrderId: item.purchaseOrderId || null,
        purchaseOrderItemId: item.purchaseOrderId ? item.id : null,
        // If it's a direct contract item (no PO ID), link to contract item
        purchaseContractItemId: !item.purchaseOrderId ? item.id : null
      }))
    }

    try {
      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Tạo phiếu nhập kho thành công')
      dispatch(getPurchaseContracts({}))
    } catch (error) {
      console.error(error)
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

          {/* <DropdownMenuItem
            onClick={() => setShowViewDialog(true)}
          >
            Xem chi tiết
            <DropdownMenuShortcut>
              <IconEye className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem> */}

          {/* <Can permission={'PURCHASE_CONTRACT_UPDATE'}>
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
          </Can> */}

          {isCustomerContract && (
            <Can permission={'PURCHASE_CONTRACT_VIEW_ALL'}>
              <DropdownMenuItem
                onClick={handlePrintContract}
                className="text-purple-600"
                disabled={printLoading || installmentExporting}
              >
                In Hợp Đồng
                <DropdownMenuShortcut>
                  <IconFileTypeDocx className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {canImport && (
            <Can permission={'WAREHOUSE_IMPORT_CREATE'}>
              <DropdownMenuItem
                onClick={handleImportWarehouse}
                className="text-blue-600"
              >
                Nhập kho
                <DropdownMenuShortcut>
                  <IconPackageImport className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {canCreatePayment && (
            <DropdownMenuItem
              onClick={handleCreatePaymentClick}
              className="text-green-600"
            >
              Tạo phiếu chi
              <DropdownMenuShortcut>
                <CreditCard className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {canLiquidate && (
            <Can permission={'PURCHASE_CONTRACT_LIQUIDATE'}>
              <DropdownMenuItem
                onClick={() => setShowLiquidationDialog(true)}
                className="text-orange-600"
              >
                Thanh lý
                <DropdownMenuShortcut>
                  <IconReceiptRefund className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {contract.status === 'liquidated' && (
            <DropdownMenuItem
              onClick={() => setShowCancelLiquidateConfirm(true)}
              className="text-yellow-600"
            >
              Hủy Thanh Lý
              <DropdownMenuShortcut>
                <IconReceiptRefund className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {canDelete && (
            <Can permission={'PURCHASE_CONTRACT_DELETE'}>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                Xóa
                <DropdownMenuShortcut>
                  <IconTrash className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showImportDialog && (
        <ConfirmImportWarehouseDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          purchaseContractId={contract.id}
          onConfirm={handleCreateWarehouseReceipt}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )}

      {showCreatePaymentDialog && (
        <PaymentFormDialog
          open={showCreatePaymentDialog}
          onOpenChange={setShowCreatePaymentDialog}
          purchaseOrder={(fullContract || contract)?.purchaseOrders?.[0]}
          supplier={(fullContract || contract)?.supplier}
          onSuccess={() => dispatch(getPurchaseContracts({}))}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )}

      {showViewDialog && (
        <ViewPurchaseContractDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          purchaseContractId={contract.id}
          showTrigger={false}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )
      }

      {
        showLiquidationDialog && (
          <LiquidatePurchaseContractDialog
            open={showLiquidationDialog}
            onOpenChange={setShowLiquidationDialog}
            contractId={contract.id}
            contentClassName="z-[10006]"
            overlayClassName="z-[10005]"
          />
        )
      }

      {
        showUpdateDialog && canEdit && (
          <UpdatePurchaseContractDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            contractId={contract.id}
          />
        )
      }

      {
        showDeleteDialog && canDelete && (
          <DeletePurchaseContractDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            contractId={contract.id}
          />
        )
      }

      {installmentData && (
        <PurchaseContractPreviewDialog
          open={showInstallmentPreview}
          onOpenChange={(open) => {
            if (!open) setShowInstallmentPreview(false)
          }}
          initialData={installmentData}
          onConfirm={async (finalData) => {
            try {
              setInstallmentExporting(true)
              await exportPurchaseContractWord(finalData, installmentFileName)
              toast.success('Đã xuất hợp đồng thành công')
              setShowInstallmentPreview(false)
            } catch (error) {
              console.error('Export purchase contract error:', error)
              toast.error('Xuất hợp đồng thất bại')
            } finally {
              setInstallmentExporting(false)
            }
          }}
        />
      )}

      <AlertDialog open={showCancelLiquidateConfirm} onOpenChange={setShowCancelLiquidateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy thanh lý</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn hủy thanh lý hợp đồng <strong>{contract.code}</strong> không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={async () => {
                try {
                  await dispatch(cancelLiquidatePurchaseContract(contract.id)).unwrap()
                } catch (e) { /* toast handled by thunk */ }
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { DataTableRowActions }
