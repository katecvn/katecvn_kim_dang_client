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
  IconCircleX,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeleteInvoiceDialog from './DeleteInvoiceDialog'
import RejectInvoiceDialog from './RejectInvoiceDialog'
import InvoiceDialog from './InvoiceDialog'
import CreateCreditNoteDialog from './CreateCreditNoteDialog'
import ViewInvoiceDialog from './ViewInvoiceDialog'
import EInvoicePublishDialog from './EInvoicePublishDialog'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'
import CreateReceiptDialog from '../../receipt/components/CreateReceiptDialog'
import CreateSalesContractDialog from '../../sales-contract/components/CreateSalesContractDialog'
import {
  downloadPreviewDraftInvoice,
  getPreviewData,
  createSInvoice,
} from '@/api/s_invoice'
import {
  generateWarehouseReceiptFromInvoice,
  postWarehouseReceipt,
} from '@/stores/WarehouseReceiptSlice'
import { getInvoices, updateInvoiceStatus } from '@/stores/InvoiceSlice'
import { increasePrintAttempt, increasePrintSuccess } from '@/stores/SalesContractSlice'
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
  const [showRejectInvoiceDialog, setShowRejectInvoiceDialog] = useState(false)
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
  const [showCreateReceiptDialog, setShowCreateReceiptDialog] = useState(false)
  const [showCreateSalesContractDialog, setShowCreateSalesContractDialog] = useState(false)

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



    // Show confirmation dialog
    setShowConfirmWarehouseDialog(true)
  }

  const handleConfirmCreateWarehouseReceipt = async (selectedItemIds) => {
    const invoiceId = invoice?.id
    if (!invoiceId) return

    try {
      setWarehouseLoading(true)
      const data = await dispatch(
        generateWarehouseReceiptFromInvoice({
          invoiceId,
          selectedItemIds,
          type: 'retail',
        }),
      ).unwrap()
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
      await dispatch(postWarehouseReceipt(warehouseReceiptId)).unwrap()
      // Toast is handled in slice for postWarehouseReceipt ("Duyệt phiếu thành công")
      // toast.success('Đã ghi sổ kho thành công')

      // Refresh invoice list
      await dispatch(
        getInvoices({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
    } catch (error) {
      console.error('Post warehouse receipt error:', error)
      // Error toast is handled in slice
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

  const handleCreateReceipt = () => {
    if (invoice?.paymentStatus === 'paid' || invoice?.status === 'rejected') {
      toast.warning('Không thể tạo phiếu thu cho hóa đơn đã thanh toán hoặc bị từ chối')
      return
    }
    setShowCreateReceiptDialog(true)
  }

  const handleCreateSalesContract = () => {
    if (invoice?.salesContract) {
      toast.warning('Đơn hàng này đã lập hợp đồng')
      return
    }
    setShowCreateSalesContractDialog(true)
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
      {showRejectInvoiceDialog && (
        <RejectInvoiceDialog
          open={showRejectInvoiceDialog}
          onOpenChange={setShowRejectInvoiceDialog}
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
          onEdit={() => {
            setShowViewInvoiceDialog(false)
            setTimeout(() => {
              setShowUpdatePendingInvoiceDialog(true)
            }, 100)
          }}
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

      {showCreateReceiptDialog && (
        <CreateReceiptDialog
          invoices={[invoice.id]}
          open={showCreateReceiptDialog}
          onOpenChange={setShowCreateReceiptDialog}
          showTrigger={false}
          table={{ resetRowSelection: () => { } }} // Mock table object needed for dialog
        />
      )}

      {showCreateSalesContractDialog && (
        <CreateSalesContractDialog
          invoiceIds={[invoice.id]}
          open={showCreateSalesContractDialog}
          onOpenChange={setShowCreateSalesContractDialog}
          showTrigger={false}
          table={{ resetRowSelection: () => { } }} // Mock table object needed for dialog
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
            className="text-slate-600"
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

          {row?.original?.status === 'pending' && (
            <Can permission="REJECT_INVOICE">
              <DropdownMenuItem
                onClick={() => setShowRejectInvoiceDialog(true)}
                className="text-red-600"
              >
                Hủy
                <DropdownMenuShortcut>
                  <IconCircleX className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuSeparator />

          {/* In Hóa Đơn */}
          <DropdownMenuItem onClick={handlePrintInvoice} className="text-purple-600">
            In Hóa Đơn
            <DropdownMenuShortcut>
              <IconFileTypePdf className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {/* In Thỏa Thuận Mua Bán */}
          <DropdownMenuItem onClick={handlePrintAgreement} className="text-purple-600">
            In Thỏa Thuận Mua Bán
            <DropdownMenuShortcut>
              <IconFileTypePdf className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {/* In Hợp Đồng Bán Hàng */}
          <DropdownMenuItem onClick={handlePrintInstallment} className="text-purple-600">
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
                className="text-indigo-600"
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
            <DropdownMenuItem onClick={handleDownloadPreviewSInvoice} className="text-sky-600">
              Xem trước HĐĐT
              <DropdownMenuShortcut>
                <IconFileTypePdf className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          {/* Phát hành HĐĐT */}
          <Can permission="ISSUE_SINVOICE_HIDE">
            <DropdownMenuItem onClick={handleOpenPublishEInvoice} className="text-cyan-600">
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
                className="text-violet-600"
              >
                In hợp đồng
                <DropdownMenuShortcut>
                  <IconFileTypePdf className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuSeparator />

          {/* Create Receipt */}
          {(invoice?.status === 'accepted' || invoice?.status === 'delivered') && (
            <Can permission="CREATE_RECEIPT">
              <DropdownMenuItem onClick={handleCreateReceipt} className="text-emerald-600">
                Tạo Phiếu Thu
                <DropdownMenuShortcut>
                  <IconPlus className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {/* Create Sales Contract */}
          {/* {invoice?.status === 'accepted' && !invoice?.salesContract && (
            <Can permission="CREATE_SALES_CONTRACT">
              <DropdownMenuItem onClick={handleCreateSalesContract} className="text-indigo-600">
                Tạo Hợp Đồng
                <DropdownMenuShortcut>
                  <IconPlus className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )} */}

          {/* ===== WAREHOUSE RECEIPT ACTIONS ===== */}
          {/* Tạo Phiếu Xuất Kho - Chỉ hiển thị khi status = accepted */}
          {row?.original?.status === 'accepted' && (
            <Can permission="CREATE_INVOICE">
              <DropdownMenuItem
                onClick={handleCreateWarehouseReceipt}
                disabled={warehouseLoading}
                className="text-orange-600"
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
                className="text-orange-600"
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
              className="text-orange-600"
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
        <InvoiceDialog
          open={showUpdatePendingInvoiceDialog}
          onOpenChange={setShowUpdatePendingInvoiceDialog}
          invoiceId={row.original.id}
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
              // 1. Ghi nhận print attempt
              if (finalData.salesContractId) {
                dispatch(increasePrintAttempt(finalData.salesContractId))
              }

              setInstallmentExporting(true)
              await exportInstallmentWord(finalData, installmentFileName)

              // 2. Ghi nhận print success sau khi export thành công
              if (finalData.salesContractId) {
                await dispatch(increasePrintSuccess(finalData.salesContractId)).unwrap()
                // Không cần refresh invoice list ở đây vì print count chỉ hiện trong dialog chi tiết
              }

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
