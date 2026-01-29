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
import { useDispatch } from 'react-redux'
import { generateWarehouseReceiptFromInvoice } from '@/stores/WarehouseReceiptSlice'
import { toast } from 'sonner'
import { getSalesContracts, getSalesContractDetail } from '@/stores/SalesContractSlice'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'
import { IconFileTypePdf } from '@tabler/icons-react'
import { buildInstallmentData } from '../../invoice/helpers/BuildInstallmentData'
import InstallmentPreviewDialog from '../../invoice/components/InstallmentPreviewDialog'
import { exportInstallmentWord } from '../../invoice/helpers/ExportInstallmentWord'

const DataTableRowActions = ({ row }) => {
  const contract = row?.original || {}
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  // Kiểm tra xem có thể sửa không dựa vào status
  // Chỉ có thể sửa khi status = 'draft' (Đang chờ)
  const canEdit = contract.status === 'draft'

  // Chỉ có thể xóa khi status = 'draft' (Đang chờ)
  const canDelete = contract.status === 'draft'

  const dispatch = useDispatch()
  const [warehouseLoading, setWarehouseLoading] = useState(false)
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)
  const [dialogData, setDialogData] = useState(null)

  // Print Contract State
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-ban-hang.docx')
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentExporting, setInstallmentExporting] = useState(false)

  const handlePrintContract = async () => {
    // Chỉ cho phép in khi status = 'confirmed' (Đã xác nhận)
    if (contract.status !== 'confirmed') {
      toast.warning('Chỉ có thể in hợp đồng khi trạng thái là "Đã xác nhận"')
      return
    }

    try {
      // Get first invoice from the selected contract
      if (!contract.invoices || contract.invoices.length === 0) {
        toast.warning('Hợp đồng này không có hóa đơn')
        return
      }

      // Use the first invoice data to build installment data
      const invoiceData = {
        ...contract.invoices[0],
        salesContract: contract
      }

      const baseInstallmentData = await buildInstallmentData(invoiceData)

      setInstallmentData(baseInstallmentData)
      setInstallmentFileName(`hop-dong-ban-hang-${contract.code || 'contract'}.docx`)
      setShowInstallmentPreview(true)
    } catch (error) {
      console.error('Load installment data error:', error)
      toast.error('Không lấy được dữ liệu hợp đồng bán hàng')
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

      // Map contract details to invoice items structure for the dialog
      const mappedItems = contractDetail?.items?.map(item => ({
        id: item.id,
        productName: item.product?.name,
        quantity: item.quantity,
        unitName: item.unit?.name,
        salesContractItemId: item.id, // Mark as contract item
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


          <Can permission={'UPDATE_SALES_CONTRACT'}>
            <DropdownMenuItem
              onClick={handlePrintContract}
              className="text-orange-600"
              disabled={installmentExporting}
            >
              In Hợp Đồng
              <DropdownMenuShortcut>
                <IconFileTypePdf className="h-4 w-4" />
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

      {installmentData && (
        <InstallmentPreviewDialog
          open={showInstallmentPreview}
          onOpenChange={(open) => {
            if (!open) {
              setShowInstallmentPreview(false)
            }
          }}
          initialData={installmentData}
          onConfirm={async (finalData) => {
            try {
              setInstallmentExporting(true)
              await exportInstallmentWord(finalData, installmentFileName)
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
    </>
  )
}

export { DataTableRowActions }
