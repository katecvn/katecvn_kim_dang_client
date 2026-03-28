import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Printer } from 'lucide-react'
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
  IconFileInvoice,
  IconPackageExport,
  IconArchive,
  IconFileTypeDocx,
  IconPlus,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeleteSalesContractDialog from './DeleteSalesContractDialog'
import UpdateSalesContractDialog from './UpdateSalesContractDialog'
import LiquidateContractDialog from './LiquidateContractDialog'
import { useDispatch } from 'react-redux'
import { createWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { toast } from 'sonner'
import { getSalesContracts, getSalesContractDetail, cancelLiquidateSalesContract, increasePrintAttempt, increasePrintSuccess } from '@/stores/SalesContractSlice'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'
import { IconFileTypePdf } from '@tabler/icons-react'
import { buildInstallmentDataV3 } from '../../invoice/helpers/BuildInstallmentDataV3'
import InstallmentPreviewDialogV3 from '../../invoice/components/InstallmentPreviewDialogV3'
import { getInvoiceDetail } from '@/api/invoice'
import { exportInstallmentWordV3 } from '../../invoice/helpers/ExportInstallmentWordV3'
import ReceiptDialog from '@/views/admin/receipt/components/ReceiptDialog'

const DataTableRowActions = ({ row }) => {
  const contract = row?.original || {}
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  // Kiểm tra xem có thể sửa không dựa vào status
  // Chỉ có thể sửa khi status = 'draft' (Đang chờ)
  const canEdit = contract.status === 'draft'

  // Chỉ có thể xóa khi status = 'draft' (Đang chờ)
  const canDelete = contract.status === 'draft' || contract.status === 'cancelled'

  // Chỉ có thể xuất kho khi status = 'confirmed'
  const canExport = contract.status === 'confirmed'

  const dispatch = useDispatch()
  const [warehouseLoading, setWarehouseLoading] = useState(false)
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)
  const [dialogData, setDialogData] = useState(null)
  const [showLiquidationDialog, setShowLiquidationDialog] = useState(false)
  const [showCancelLiquidateConfirm, setShowCancelLiquidateConfirm] = useState(false)

  // Print Contract State
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-ban-hang.docx')
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentExporting, setInstallmentExporting] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)

  const handleCreateReceipt = () => {
    // Check if contract has invoices
    if (!contract?.invoices || contract.invoices.length === 0) {
      toast.warning('Hợp đồng chưa có hóa đơn để tạo phiếu thu')
      return
    }
    setShowReceiptDialog(true)
  }

  const handleCreateReceiptSuccess = () => {
    setShowReceiptDialog(false)
    toast.success('Tạo phiếu thu thành công')
    dispatch(getSalesContracts({}))
  }

  const handlePrintContract = async () => {
    try {
      setPrintLoading(true)
      // Fetch contract detail to ensure we have the invoices array
      const contractDetail = await dispatch(getSalesContractDetail(contract.id)).unwrap()

      // Get first invoice from the selected contract
      if (!contractDetail.invoices || contractDetail.invoices.length === 0) {
        toast.warning('Hợp đồng này chưa có hóa đơn')
        return
      }

      // Fetch full invoice detail to ensure all data is present
      const invoiceId = contractDetail.invoices[0].id
      const fullInvoiceData = await getInvoiceDetail(invoiceId)

      const baseInstallmentData = await buildInstallmentDataV3({
        ...fullInvoiceData,
        salesContract: contractDetail
      })

      setInstallmentData(baseInstallmentData)
      setInstallmentFileName(`hop-dong-ban-hang-${contractDetail.code || 'contract'}.docx`)
      setShowInstallmentPreview(true)
    } catch (error) {
      console.error('Load installment data error:', error)
      toast.error('Không lấy được dữ liệu hợp đồng bán hàng')
    } finally {
      setPrintLoading(false)
    }
  }

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

    try {
      setWarehouseLoading(true)
      // Fetch contract detail to get items
      const contractDetail = await dispatch(getSalesContractDetail(contract.id)).unwrap()

      const detailFirstInvoice = contractDetail?.invoices?.[0]
      const hasCompletedPayment = detailFirstInvoice?.paymentVouchers?.some(
        (voucher) => voucher.status === 'completed'
      ) || contractDetail?.paymentVouchers?.some(
        (voucher) => voucher.status === 'completed'
      ) || contract?.paymentStatus === 'partial' || contract?.paymentStatus === 'paid'

      if (!hasCompletedPayment) {
        toast.warning('Hợp đồng bán phải có ít nhất một phiếu thu đã ghi sổ (đã thu) mới được tạo phiếu xuất kho')
        setWarehouseLoading(false)
        return
      }

      // Map contract details to invoice items structure for the dialog
      const mappedItems = contractDetail?.items?.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name,
        productCode: item.product?.code,
        image: item.product?.image,
        product: item.product,
        quantity: item.quantity,
        unitName: item.unit?.name,
        unitId: item.unitId,
        salesContractItemId: item.id, // Mark as contract item
        price: item.unitPrice,
      })) || []

      // Construct object compat with dialog
      setDialogData({
        ...firstInvoice,
        code: firstInvoice.code,
        customer: contract.customer,
        invoiceItems: mappedItems
      })

      setShowConfirmWarehouseDialog(true)
    } catch (error) {
      console.error('Fetch contract detail error:', error)
      toast.error('Không thể lấy chi tiết hợp đồng')
    } finally {
      setWarehouseLoading(false)
    }
  }

  const handleConfirmCreateWarehouseReceipt = async (selectedItems, actualReceiptDate) => {
    const firstInvoice = contract.invoices?.[0]
    if (!firstInvoice) return

    try {
      setWarehouseLoading(true)

      // Selected items details
      const selectedDetails = selectedItems
        .map(item => ({
          productId: item.productId || item.id,
          unitId: item.unitId || item.unit?.id,
          movement: 'out',
          qtyActual: item.quantity,
          unitPrice: item.price || 0,
          content: `Xuất kho theo HĐ ${contract.code}`,
          salesContractId: contract.id,
          salesContractItemId: item.salesContractItemId
        }))

      if (selectedDetails.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm')
        return
      }

      const payload = {
        receiptType: 2,
        businessType: 'sale_out',

        actualReceiptDate: actualReceiptDate || null,
        reason: `Xuất kho cho HĐ ${contract.code}`,
        note: contract.note || '',
        warehouseId: null,
        customerId: contract.customerId,
        salesContractId: contract.id,
        details: selectedDetails
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()

      toast.success('Đã tạo phiếu xuất kho thành công')

      // Refresh list
      await dispatch(getSalesContracts({})).unwrap()
    } catch (error) {
      console.error('Create warehouse receipt error:', error)
      toast.error('Tạo phiếu xuất kho thất bại')
    } finally {
      setWarehouseLoading(false)
    }
  }

  const handleLiquidationSuccess = () => {
    dispatch(getSalesContracts({}))
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


          <Can permission={'SALES_CONTRACT_VIEW_ALL'}>
            <DropdownMenuItem
              onClick={handlePrintContract}
              className="text-purple-600"
              disabled={installmentExporting || printLoading}
            >
              In Hợp Đồng
              <DropdownMenuShortcut>
                <IconFileTypeDocx className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          {(!['draft', 'cancelled', 'liquidated'].includes(contract?.status) && contract?.paymentStatus !== 'paid') && (
            <Can permission="RECEIPT_CREATE">
              <DropdownMenuItem onClick={handleCreateReceipt} className="text-emerald-600">
                Tạo Phiếu Thu
                <DropdownMenuShortcut>
                  <IconPlus className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {/* <Can permission={'UPDATE_SALES_CONTRACT'}>
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

          {canExport && (
            <Can permission={'WAREHOUSE_EXPORT_CREATE'}>
              <DropdownMenuItem
                onClick={handleCreateWarehouseReceipt}
                className="text-blue-600"
              >
                Xuất kho
                <DropdownMenuShortcut>
                  <IconPackageExport className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {contract.status === 'confirmed' && (
            <Can permission={'SALES_CONTRACT_LIQUIDATE'}>
              <DropdownMenuItem
                onClick={() => setShowLiquidationDialog(true)}
                className="text-orange-600"
              >
                Thanh lý
                <DropdownMenuShortcut>
                  <IconArchive className="h-4 w-4" />
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
                <IconArchive className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {canDelete && (
            <Can permission={'SALES_CONTRACT_DELETE'}>
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

      {showConfirmWarehouseDialog && (
        <ConfirmWarehouseReceiptDialog
          open={showConfirmWarehouseDialog}
          onOpenChange={setShowConfirmWarehouseDialog}
          invoice={dialogData}
          onConfirm={handleConfirmCreateWarehouseReceipt}
          loading={warehouseLoading}
          type="contract"
        />
      )}

      {showLiquidationDialog && (
        <LiquidateContractDialog
          open={showLiquidationDialog}
          onOpenChange={setShowLiquidationDialog}
          contractId={contract.id}
          onSuccess={handleLiquidationSuccess}
        />
      )}

      {installmentData && (
        <InstallmentPreviewDialogV3
          open={showInstallmentPreview}
          onOpenChange={setShowInstallmentPreview}
          initialData={installmentData}
          onConfirm={async (finalData) => {
            try {
              setInstallmentExporting(true)
              await exportInstallmentWordV3(finalData, installmentFileName)

              // 1. Ghi nhận print attempt (Track print attempt in background)
              if (finalData.salesContractId) {
                dispatch(increasePrintAttempt(finalData.salesContractId))
                  .unwrap()
                  .then(() => {
                    dispatch(increasePrintSuccess(finalData.salesContractId))
                  })
                  .catch(e => console.error('Failed to log print attempt:', e))
              }

              toast.success('Đã xuất hợp đồng bán hàng thành công')
              setShowInstallmentPreview(false)
            } catch (error) {
              console.error('Export installment error:', error)
              toast.error('Xuất hợp đồng bán hàng thất bại')
            } finally {
              setInstallmentExporting(false)
            }
          }}
        />
      )}

      {showReceiptDialog && (
        <ReceiptDialog
          open={showReceiptDialog}
          onOpenChange={setShowReceiptDialog}
          invoices={contract?.invoices?.[0]?.id ? [contract.invoices[0].id] : []}
          showTrigger={false}
          onSuccess={handleCreateReceiptSuccess}
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
                  await dispatch(cancelLiquidateSalesContract(contract.id)).unwrap()
                  dispatch(getSalesContracts({}))
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
