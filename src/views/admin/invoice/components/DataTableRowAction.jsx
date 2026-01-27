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
  IconFileTypePdf,
  IconPencil,
  IconPlus,
  IconTrash,
  IconEye,
  IconPackageExport,
  IconCheck,
  IconPackage,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeleteInvoiceDialog from './DeleteInvoiceDialog'
import UpdateInvoiceDialog from '@/views/admin/invoice/components/UpdateInvoiceDialog.jsx'
import CreateCreditNoteDialog from './CreateCreditNoteDialog'
import ViewInvoiceDialog from './ViewInvoiceDialog'
import EInvoicePublishDialog from './EInvoicePublishDialog'
import ConfirmWarehouseReceiptDialog from './ConfirmWarehouseReceiptDialog'
import {
  downloadPreviewDraftInvoice,
  getPreviewData,
  createSInvoice,
} from '@/api/s_invoice'
import {
  generateWarehouseReceiptFromInvoice,
  postWarehouseReceipt,
} from '@/api/warehouse_receipt'
import { getInvoices } from '@/stores/InvoiceSlice'
import {
  getEndOfCurrentMonth,
  getStartOfCurrentMonth,
} from '@/utils/date-format'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'
import PrintInvoiceView from './PrintInvoiceView'
import AgreementPreviewDialog from './AgreementPreviewDialog'
import InstallmentPreviewDialog from './InstallmentPreviewDialog'
import { buildAgreementData } from '../helpers/BuildAgreementData'
import { buildInstallmentData } from '../helpers/BuildInstallmentData'
import { exportAgreementPdf } from '../helpers/ExportAgreementPdfV2'
import { exportInstallmentWord } from '../helpers/ExportInstallmentWord'

const DataTableRowActions = ({ row }) => {
  const invoice = row?.original || {}
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.setting.loading)
  const setting = useSelector((state) => state.setting.setting)
  const [showDeleteInvoiceDialog, setShowDeleteInvoiceDialog] = useState(false)
  const [showUpdatePendingInvoiceDialog, setShowUpdatePendingInvoiceDialog] =
    useState(false)
  const [showCreateCreditNoteDialog, setShowCreateCreditNoteDialog] =
    useState(false)
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
  const [showEInvoiceDialog, setShowEInvoiceDialog] = useState(false)
  const [eInvoicePreviewData, setEInvoicePreviewData] = useState(null)
  const [eInvoiceLoading, setEInvoiceLoading] = useState(false)
  const [warehouseLoading, setWarehouseLoading] = useState(false)
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)
  
  // Print state
  const [printInvoice, setPrintInvoice] = useState(null)
  const [showAgreementPreview, setShowAgreementPreview] = useState(false)
  const [agreementData, setAgreementData] = useState(null)
  const [agreementFileName, setAgreementFileName] = useState('thoa-thuan-mua-ban.pdf')
  const [agreementExporting, setAgreementExporting] = useState(false)
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-tra-cham.docx')
  const [installmentExporting, setInstallmentExporting] = useState(false)

  const handleDownloadPreviewSInvoice = async () => {
    const invoiceId = invoice?.id
    if (!invoiceId) return

    try {
      await downloadPreviewDraftInvoice(invoiceId)
    } catch (error) {
      console.error('Download preview error: ', error)
      toast.error('Không tải được file xem trước hóa đơn điện tử')
    }
  }

  const handleOpenPublishEInvoice = async () => {
    const invoiceId = invoice?.id
    if (!invoiceId) return

    const eInvoiceStatus = invoice?.sInvoiceStatus || invoice?.sInvoice?.status
    const invoiceStatus = invoice?.status

    if (eInvoiceStatus === 'published') {
      toast.warning('Hóa đơn điện tử này đã được phát hành')
      return
    }

    if (invoiceStatus !== 'accepted') {
      toast.warning('Hóa đơn chưa được duyệt, không thể phát hành HĐĐT')
      return
    }

    try {
      setEInvoiceLoading(true)
      const data = await getPreviewData(invoiceId)
      setEInvoicePreviewData(data)
      setShowEInvoiceDialog(true)
    } catch (error) {
      console.error('Load e-invoice preview error: ', error)
      toast.error('Không lấy được dữ liệu xem trước hóa đơn điện tử')
    } finally {
      setEInvoiceLoading(false)
    }
  }

  // ===== WAREHOUSE RECEIPT HANDLERS =====
  const handleCreateWarehouseReceipt = async () => {
    const invoiceStatus = invoice?.status
    if (invoiceStatus !== 'accepted') {
      toast.warning('Chỉ có thể tạo phiếu xuất kho cho đơn hàng đã duyệt')
      return
    }

    if (invoice?.warehouseReceiptId) {
      toast.warning('Đơn hàng này đã có phiếu xuất kho')
      return
    }

    // Show confirmation dialog
    setShowConfirmWarehouseDialog(true)
  }

  const handleConfirmCreateWarehouseReceipt = async () => {
    const invoiceId = invoice?.id
    if (!invoiceId) return

    try {
      setWarehouseLoading(true)
      const data = await generateWarehouseReceiptFromInvoice(invoiceId)
      toast.success(`Đã tạo phiếu xuất kho ${data?.code || 'thành công'}`)

      // Refresh invoice list
      await dispatch(
        getInvoices({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
    } catch (error) {
      console.error('Create warehouse receipt error:', error)
      toast.error(
        error?.response?.data?.message || 'Tạo phiếu xuất kho thất bại'
      )
    } finally {
      setWarehouseLoading(false)
    }
  }

  const handlePostWarehouseReceipt = async () => {
    const warehouseReceiptId = invoice?.warehouseReceiptId
    if (!warehouseReceiptId) {
      toast.warning('Không tìm thấy phiếu xuất kho')
      return
    }

    const warehouseStatus = invoice?.warehouseReceipt?.status
    if (warehouseStatus === 'POSTED') {
      toast.warning('Phiếu xuất kho đã được ghi sổ')
      return
    }

    try {
      setWarehouseLoading(true)
      const data = await postWarehouseReceipt(warehouseReceiptId)
      toast.success('Đã ghi sổ kho thành công')

      // Refresh invoice list
      await dispatch(
        getInvoices({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
    } catch (error) {
      console.error('Post warehouse receipt error:', error)
      toast.error(
        error?.response?.data?.message || 'Ghi sổ kho thất bại'
      )
    } finally {
      setWarehouseLoading(false)
    }
  }

  // ===== PRINT HANDLERS =====
  const handlePrintInvoice = async () => {
    const invoiceId = invoice?.id
    const getAdminInvoice = JSON.parse(
      localStorage.getItem('permissionCodes'),
    ).includes('GET_INVOICE')

    try {
      const data = getAdminInvoice
        ? await getInvoiceDetail(invoiceId)
        : await getInvoiceDetailByUser(invoiceId)
      setPrintInvoice(data)
      setTimeout(() => setPrintInvoice(null), 0)
    } catch (error) {
      console.log('Print invoice error: ', error)
      toast.error('Lỗi in hóa đơn')
    }
  }

  const handlePrintAgreement = async () => {
    const invoiceId = invoice?.id
    const getAdminInvoice = JSON.parse(
      localStorage.getItem('permissionCodes'),
    ).includes('GET_INVOICE')

    try {
      const data = getAdminInvoice
        ? await getInvoiceDetail(invoiceId)
        : await getInvoiceDetailByUser(invoiceId)

      const baseAgreementData = buildAgreementData(data)
      setAgreementData(baseAgreementData)
      setAgreementFileName(`thoa-thuan-mua-ban-${data.code || 'agreement'}.pdf`)
      setShowAgreementPreview(true)
    } catch (error) {
      console.error('Load agreement data error:', error)
      toast.error('Không lấy được dữ liệu thỏa thuận mua bán')
    }
  }

  const handlePrintInstallment = async () => {
    const invoiceId = invoice?.id
    const getAdminInvoice = JSON.parse(
      localStorage.getItem('permissionCodes'),
    ).includes('GET_INVOICE')

    try {
      const data = getAdminInvoice
        ? await getInvoiceDetail(invoiceId)
        : await getInvoiceDetailByUser(invoiceId)

      // Check if salesContract exists
      if (!data.salesContract || Object.keys(data.salesContract).length === 0) {
        toast.warning('Đơn bán này không lập hợp đồng')
        return
      }

      const baseInstallmentData = await buildInstallmentData(data)
      setInstallmentData(baseInstallmentData)
      setInstallmentFileName(`hop-dong-tra-cham-${data.code || 'contract'}.docx`)
      setShowInstallmentPreview(true)
    } catch (error) {
      console.error('Load installment data error:', error)
      toast.error('Không lấy được dữ liệu hợp đồng trả chậm')
    }
  }

  return (
    <>
      {showDeleteInvoiceDialog && (
        <DeleteInvoiceDialog
          open={showDeleteInvoiceDialog}
          onOpenChange={setShowDeleteInvoiceDialog}
          invoice={row.original}
          showTrigger={false}
        />
      )}
      {showViewInvoiceDialog && (
        <ViewInvoiceDialog
          open={showViewInvoiceDialog}
          onOpenChange={setShowViewInvoiceDialog}
          invoiceId={row.original.id}
          showTrigger={false}
        />
      )}

      {/* Confirm Warehouse Receipt Dialog */}
      {showConfirmWarehouseDialog && (
        <ConfirmWarehouseReceiptDialog
          open={showConfirmWarehouseDialog}
          onOpenChange={setShowConfirmWarehouseDialog}
          invoice={invoice}
          onConfirm={handleConfirmCreateWarehouseReceipt}
          loading={warehouseLoading}
        />
      )}

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
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => setShowViewInvoiceDialog(true)}
          >
            Xem
            <DropdownMenuShortcut>
              <IconEye className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {row?.original?.status === 'pending' && (
            <Can permission="GET_INVOICE">
              <DropdownMenuItem
                onClick={() => setShowUpdatePendingInvoiceDialog(true)}
                className="text-blue-600"
              >
                Sửa
                <DropdownMenuShortcut>
                  <IconPencil className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}
          
          <DropdownMenuSeparator />

          {/* In Hóa Đơn */}
          <DropdownMenuItem onClick={handlePrintInvoice}>
            In Hóa Đơn
            <DropdownMenuShortcut>
              <IconFileTypePdf className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {/* In Thỏa Thuận Mua Bán */}
          <DropdownMenuItem onClick={handlePrintAgreement}>
            In Thỏa Thuận Mua Bán
            <DropdownMenuShortcut>
              <IconFileTypePdf className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {/* In Hợp Đồng Bán Hàng */}
          <DropdownMenuItem onClick={handlePrintInstallment}>
            In Hợp Đồng Bán Hàng
            <DropdownMenuShortcut>
              <IconFileTypePdf className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {row?.original?.status === 'accepted' && (
            <Can permission="CREATE_INVOICE">
              <DropdownMenuItem
                onClick={() => setShowCreateCreditNoteDialog(true)}
              >
                HĐ điều chỉnh
                <DropdownMenuShortcut>
                  <IconPlus className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}
          {/* Xem trước HĐĐT */}
          <Can permission="PREVIEW_SINVOICE_HIDE">
            <DropdownMenuItem onClick={handleDownloadPreviewSInvoice}>
              Xem trước HĐĐT
              <DropdownMenuShortcut>
                <IconFileTypePdf className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          {/* Phát hành HĐĐT */}
          <Can permission="ISSUE_SINVOICE_HIDE">
            <DropdownMenuItem onClick={handleOpenPublishEInvoice}>
              Phát hành HĐĐT
              <DropdownMenuShortcut>
                <IconFileTypePdf className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          {/* In hợp đồng (nếu invoice từ contract) */}
          {invoice?.salesContractId && (
            <Can permission="VIEW_SALES_CONTRACT">
              <DropdownMenuItem
                onClick={() => {
                  window.open(`/sales-contracts?view=${invoice.salesContractId}`, '_blank')
                }}
              >
                In hợp đồng
                <DropdownMenuShortcut>
                  <IconFileTypePdf className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuSeparator />

          {/* ===== WAREHOUSE RECEIPT ACTIONS ===== */}
          {/* Tạo Phiếu Xuất Kho - Chỉ hiển thị khi status = accepted và chưa có phiếu kho */}
          {row?.original?.status === 'accepted' && !row?.original?.warehouseReceiptId && (
            <Can permission="CREATE_INVOICE">
              <DropdownMenuItem
                onClick={handleCreateWarehouseReceipt}
                disabled={warehouseLoading}
                className="text-blue-600"
              >
                Tạo Phiếu Xuất Kho
                <DropdownMenuShortcut>
                  <IconPackageExport className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {/* Ghi Sổ Kho - Chỉ hiển thị khi có phiếu kho DRAFT */}
          {row?.original?.warehouseReceipt?.status === 'DRAFT' && (
            <Can permission="CREATE_INVOICE">
              <DropdownMenuItem
                onClick={handlePostWarehouseReceipt}
                disabled={warehouseLoading}
                className="text-green-600"
              >
                Ghi Sổ Kho
                <DropdownMenuShortcut>
                  <IconCheck className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {/* Xem Phiếu Kho - Hiển thị khi đã có phiếu kho */}
          {row?.original?.warehouseReceiptId && (
            <DropdownMenuItem
              onClick={() => {
                toast.info(`Phiếu kho: ${invoice?.warehouseReceipt?.code || invoice?.warehouseReceiptId}`)
                // TODO: Navigate to warehouse receipt detail page when available
                // window.open(`/warehouse-receipts?view=${invoice.warehouseReceiptId}`, '_blank')
              }}
            >
              Xem Phiếu Kho
              <DropdownMenuShortcut>
                <IconPackage className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {row?.original?.status === 'pending' && (
            <Can permission="DELETE_INVOICE">
              <DropdownMenuItem
                onSelect={() => setShowDeleteInvoiceDialog(true)}
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
      {showUpdatePendingInvoiceDialog && (
        <UpdateInvoiceDialog
          open={showUpdatePendingInvoiceDialog}
          onOpenChange={setShowUpdatePendingInvoiceDialog}
          invoiceUpdateId={row.original.id}
          showTrigger={false}
        />
      )}

      {showCreateCreditNoteDialog && (
        <CreateCreditNoteDialog
          open={showCreateCreditNoteDialog}
          onOpenChange={setShowCreateCreditNoteDialog}
          showTrigger={false}
          originalInvoice={row.original}
          type={row.original.type}
        />
      )}

      {/* Dialog phát hành HĐĐT */}
      {eInvoicePreviewData && (
        <EInvoicePublishDialog
          open={showEInvoiceDialog}
          onOpenChange={(open) => {
            if (!open) setShowEInvoiceDialog(false)
          }}
          initialData={eInvoicePreviewData}
          onConfirm={async (overridePayload) => {
            try {
              setEInvoiceLoading(true)
              await createSInvoice({
                invoiceId: invoice?.id,
                overrides: { ...overridePayload },
              })
              toast.success('Phát hành hóa đơn điện tử thành công')

              await dispatch(
                getInvoices({
                  fromDate: getStartOfCurrentMonth(),
                  toDate: getEndOfCurrentMonth(),
                }),
              ).unwrap()

              setShowEInvoiceDialog(false)
            } catch (error) {
              console.error('Create e-invoice error: ', error)
              toast.error(
                error?.response?.data?.message ||
                'Phát hành hóa đơn điện tử thất bại',
              )
            } finally {
              setEInvoiceLoading(false)
            }
          }}
          loading={loading || eInvoiceLoading}
        />
      )}

      {/* Print Invoice Dialog */}
      {printInvoice && setting && (
        <PrintInvoiceView invoice={printInvoice} setting={setting} />
      )}

      {/* Print Agreement Dialog */}
      {agreementData && (
        <AgreementPreviewDialog
          open={showAgreementPreview}
          onOpenChange={(open) => {
            if (!open) setShowAgreementPreview(false)
          }}
          initialData={agreementData}
          onConfirm={async (finalData) => {
            try {
              setAgreementExporting(true)
              await exportAgreementPdf(finalData, agreementFileName)
              toast.success('Đã in thỏa thuận mua bán thành công')
              setShowAgreementPreview(false)
            } catch (error) {
              console.error('Export agreement error:', error)
              toast.error('In thỏa thuận mua bán thất bại')
            } finally {
              setAgreementExporting(false)
            }
          }}
        />
      )}

      {/* Print Installment Dialog */}
      {installmentData && (
        <InstallmentPreviewDialog
          open={showInstallmentPreview}
          onOpenChange={(open) => {
            if (!open) setShowInstallmentPreview(false)
          }}
          initialData={installmentData}
          onConfirm={async (finalData) => {
            try {
              setInstallmentExporting(true)
              await exportInstallmentWord(finalData, installmentFileName)
              toast.success('Đã xuất hợp đồng trả chậm thành công')
              setShowInstallmentPreview(false)
            } catch (error) {
              console.error('Export installment error:', error)
              toast.error('Xuất hợp đồng trả chậm thất bại')
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
