import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconFileTypePdf,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeleteInvoiceDialog from './DeleteInvoiceDialog'
import UpdateInvoiceDialog from '@/views/admin/invoice/components/UpdateInvoiceDialog.jsx'
import CreateCreditNoteDialog from './CreateCreditNoteDialog'
import EInvoicePublishDialog from './EInvoicePublishDialog'
import {
  downloadPreviewDraftInvoice,
  getPreviewData,
  createSInvoice,
} from '@/api/s_invoice'
import { getInvoices } from '@/stores/InvoiceSlice'
import {
  getEndOfCurrentMonth,
  getStartOfCurrentMonth,
} from '@/utils/date-format'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const DataTableRowActions = ({ row }) => {
  const invoice = row?.original || {}
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.setting.loading)
  const [showDeleteInvoiceDialog, setShowDeleteInvoiceDialog] = useState(false)
  const [showUpdatePendingInvoiceDialog, setShowUpdatePendingInvoiceDialog] =
    useState(false)
  const [showCreateCreditNoteDialog, setShowCreateCreditNoteDialog] =
    useState(false)
  const [showEInvoiceDialog, setShowEInvoiceDialog] = useState(false)
  const [eInvoicePreviewData, setEInvoicePreviewData] = useState(null)
  const [eInvoiceLoading, setEInvoiceLoading] = useState(false)

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
        <DropdownMenuContent align="end" className="w-40">
          {row?.original?.status !== 'accepted' && (
            <Can permission="GET_INVOICE">
              <DropdownMenuItem
                onClick={() => setShowUpdatePendingInvoiceDialog(true)}
              >
                Sửa
                <DropdownMenuShortcut>
                  <IconPencil className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}
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

          <Can permission="DELETE_INVOICE">
            <DropdownMenuItem onSelect={() => setShowDeleteInvoiceDialog(true)}>
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>
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
    </>
  )
}

export { DataTableRowActions }
