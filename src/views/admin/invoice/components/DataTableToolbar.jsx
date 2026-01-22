import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import CreateInvoiceDialog from './CreateInvoiceDialog'
import { IconFileTypePdf, IconFileTypeXls } from '@tabler/icons-react'
import { toast } from 'sonner'
import CreateReceiptDialog from '../../receipt/components/CreateReceiptDialog'
import CreateSalesContractDialog from '../../sales-contract/components/CreateSalesContractDialog'
import PrintInvoiceView from './PrintInvoiceView'
import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'
import { useDispatch, useSelector } from 'react-redux'
import { getSetting } from '@/stores/SettingSlice'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { getUsers } from '@/stores/UserSlice'
import ExportInvoiceDialog from './ExportInvoiceDialog'
import { getCustomers } from '@/stores/CustomerSlice'
import { exportQuotationPdf } from '../helpers/ExportQuotationPdf'
import { buildQuotationData } from '../helpers/BuildQuotationData'
import { exportAgreementPdf } from '../helpers/ExportAgreementPdf'
import { buildAgreementData } from '../helpers/BuildAgreementData'
import { exportInstallmentWord } from '../helpers/ExportInstallmentWord'
import { buildInstallmentData } from '../helpers/BuildInstallmentData'
import QuotationPreviewDialog from './QuotationPreviewDialog'
import AgreementPreviewDialog from './AgreementPreviewDialog'
import InstallmentPreviewDialog from './InstallmentPreviewDialog'
import { statuses } from '../data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical } from 'lucide-react'

const DataTableToolbar = ({ table, isMyInvoice }) => {
  const isFiltered = table.getState().columnFilters.length > 0

  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false)

  const [showCreateReceiptDialog, setShowCreateReceiptDialog] = useState(false)
  const [showCreateSalesContractDialog, setShowCreateSalesContractDialog] = useState(false)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([])
  const [selectedInvoices, setSelectedInvoices] = useState([])

  const [showQuotationPreview, setShowQuotationPreview] = useState(false)
  const [quotationData, setQuotationData] = useState(null)
  const [quotationFileName, setQuotationFileName] = useState('quotation.pdf')
  const [quotationExporting, setQuotationExporting] = useState(false)

  const [showAgreementPreview, setShowAgreementPreview] = useState(false)
  const [agreementData, setAgreementData] = useState(null)
  const [agreementFileName, setAgreementFileName] = useState('thoa-thuan-mua-ban.pdf')
  const [agreementExporting, setAgreementExporting] = useState(false)

  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-tra-cham.docx')
  const [installmentExporting, setInstallmentExporting] = useState(false)

  const handleShowCreateReceiptDialog = () => {
    const selectedRows = table.getSelectedRowModel().rows

    if (selectedRows.length !== 1) {
      toast.warning('Vui lòng chọn 1 (Một) hóa đơn')
      return
    }
    const invoices = selectedRows.map((row) => row.original.id)
    if (invoices.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 hóa đơn để tạo phiếu thu')
      return
    }
    const uniqueCustomer = [
      ...new Set(selectedRows.map((row) => row.original.customerId)),
    ]

    if (uniqueCustomer.length > 1) {
      toast.warning('Chỉ được phép tạo phiếu thu cho cùng 1 khách hàng')
      return
    }

    if (
      selectedRows.some(
        (row) =>
          row.original.status === 'paid' || row.original.status === 'rejected',
      )
    ) {
      toast.warning('Không thể tạo phiếu thu cho hóa đơn đã thanh toán')
      return
    }

    setSelectedInvoices(invoices)
    setShowCreateReceiptDialog(true)
  }

  const handleShowCreateSalesContractDialog = () => {
    const selectedRows = table.getSelectedRowModel().rows

    if (selectedRows.length !== 1) {
      toast.warning('Vui lòng chọn 1 (Một) hóa đơn')
      return
    }

    const invoiceIds = selectedRows.map((row) => row.original.id)
    setSelectedInvoiceIds(invoiceIds)
    setShowCreateSalesContractDialog(true)
  }

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  const setting = useSelector((state) => state.setting.setting)
  const loading = useSelector((state) => state.setting.loading)
  const [invoice, setInvoice] = useState(null)

  const handlePrintInvoice = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length !== 1) {
      toast.warning('Vui lòng chọn 1 (Một) hóa đơn')
      return
    }
    const invoiceId = selectedRows[0].original.id
    const getAdminInvoice = JSON.parse(
      localStorage.getItem('permissionCodes'),
    ).includes('GET_INVOICE')

    try {
      const data = getAdminInvoice
        ? await getInvoiceDetail(invoiceId)
        : await getInvoiceDetailByUser(invoiceId)
      setInvoice(data)
      table.resetRowSelection()
      setTimeout(() => setInvoice(null), 0)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  const [showExportDialog, setShowExportDialog] = useState(false)

  const users = useSelector((state) => state.user.users)
  useEffect(() => {
    dispatch(getUsers())
    dispatch(getCustomers())
  }, [dispatch])

  const isMobile = useMediaQuery('(max-width: 768px)')

  // Mobile Toolbar - Simplified
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Search section */}
        <Input
          placeholder="Tìm mã HĐ hoặc tên KH"
          value={table.getColumn('code')?.getFilterValue() || ''}
          onChange={(e) => {
            table.getColumn('code')?.setFilterValue(e.target.value)
          }}
          className="h-8 w-full text-sm"
        />

        {/* Quick actions */}
        <div className="flex gap-2">
          <Can permission={['CREATE_INVOICE']}>
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => setShowCreateInvoiceDialog(true)}
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handlePrintInvoice} className="text-xs">
                <IconFileTypePdf className="mr-2 h-3 w-3" />
                In HĐ
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowExportDialog(true)}
                className="text-xs"
              >
                <IconFileTypeXls className="mr-2 h-3 w-3" />
                Xuất file
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleShowCreateReceiptDialog}
                className="text-xs"
              >
                <PlusIcon className="mr-2 h-3 w-3" />
                Phiếu thu
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleShowCreateSalesContractDialog}
                className="text-xs"
              >
                <PlusIcon className="mr-2 h-3 w-3" />
                Hợp đồng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialogs */}
        {showCreateInvoiceDialog && (
          <CreateInvoiceDialog
            type="common_invoice"
            open={showCreateInvoiceDialog}
            onOpenChange={setShowCreateInvoiceDialog}
            showTrigger={false}
          />
        )}
        {showExportDialog && (
          <ExportInvoiceDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            isMyInvoice={isMyInvoice}
          />
        )}
        {invoice && setting && (
          <PrintInvoiceView invoice={invoice} setting={setting} />
        )}
        {showCreateReceiptDialog && (
          <CreateReceiptDialog
            invoices={selectedInvoices}
            open={showCreateReceiptDialog}
            onOpenChange={setShowCreateReceiptDialog}
            showTrigger={false}
            table={table}
          />
        )}
        {showCreateSalesContractDialog && (
          <CreateSalesContractDialog
            invoiceIds={selectedInvoiceIds}
            open={showCreateSalesContractDialog}
            onOpenChange={setShowCreateSalesContractDialog}
            showTrigger={false}
            table={table}
          />
        )}
      </div>
    )
  }

  // Desktop Toolbar - Original
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
            placeholder="Tìm theo mã HĐ"
            value={table.getColumn('code')?.getFilterValue() || ''}
            onChange={(e) =>
              table.getColumn('code')?.setFilterValue(e.target.value)
            }
            className="h-8 w-[100px] lg:w-[160px]"
          />
          <Input
            placeholder="Tìm theo tên KH, MST"
            value={table.getColumn('customer')?.getFilterValue() || ''}
            onChange={(event) =>
              table.getColumn('customer')?.setFilterValue(event.target.value)
            }
            className="h-8 w-[100px] lg:w-[200px]"
          />
        </div>

        {users && (
          <div className="flex gap-x-2">
            {table.getColumn('user') && (
              <DataTableFacetedFilter
                column={table.getColumn('user')}
                title="Người tạo"
                options={users?.map((user) => ({
                  value: user?.id,
                  label: user?.fullName,
                }))}
              />
            )}
          </div>
        )}

        {users && (
          <div className="flex gap-x-2">
            {table.getColumn('sharingRatio') && (
              <DataTableFacetedFilter
                column={table.getColumn('sharingRatio')}
                title="Chia DS"
                options={users?.map((user) => ({
                  value: user?.id,
                  label: user?.fullName,
                }))}
              />
            )}
          </div>
        )}

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
          className=""
          variant="outline"
          size="sm"
          loading={loading}
          onClick={() => setShowExportDialog(true)}
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất file HĐ
        </Button>
        {showExportDialog && (
          <ExportInvoiceDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            isMyInvoice={isMyInvoice}
          />
        )}

        {/* In HĐ */}
        <Button
          className=""
          variant="outline"
          size="sm"
          onClick={handlePrintInvoice}
          loading={loading}
        >
          <IconFileTypePdf className="mr-2 size-4" aria-hidden="true" />
          In HĐ
        </Button>
        {invoice && setting && (
          <PrintInvoiceView invoice={invoice} setting={setting} />
        )}

        {/* Báo giá PDF */}
        {/* <Button
          className=""
          variant="outline"
          size="sm"
          onClick={async () => {
            const selectedRows = table.getSelectedRowModel().rows
            if (selectedRows.length !== 1) {
              toast.warning('Vui lòng chọn 1 (Một) hóa đơn để xuất báo giá')
              return
            }

            const invoiceId = selectedRows[0].original.id
            const getAdminInvoice = JSON.parse(
              localStorage.getItem('permissionCodes'),
            ).includes('GET_INVOICE')

            try {
              const data = getAdminInvoice
                ? await getInvoiceDetail(invoiceId)
                : await getInvoiceDetailByUser(invoiceId)

              const baseQuotationData = buildQuotationData(data)

              setQuotationData(baseQuotationData)
              setQuotationFileName(`${data.code || 'quotation'}.pdf`)
              setShowQuotationPreview(true)
            } catch (error) {
              console.error('Load quotation data error:', error)
              toast.error('Không lấy được dữ liệu báo giá')
            }
          }}
          loading={loading || quotationExporting}
        >
          <IconFileTypePdf className="mr-2 size-4" aria-hidden="true" />
          Báo giá PDF
        </Button> */}

        {quotationData && (
          <QuotationPreviewDialog
            open={showQuotationPreview}
            onOpenChange={(open) => {
              if (!open) {
                setShowQuotationPreview(false)
              }
            }}
            initialData={quotationData}
            onConfirm={async (finalData) => {
              try {
                setQuotationExporting(true)
                await exportQuotationPdf(finalData, quotationFileName)
                toast.success('Đã xuất báo giá thành công')
                setShowQuotationPreview(false)
                table.resetRowSelection()
              } catch (error) {
                console.error('Export quotation error:', error)
                toast.error('Xuất báo giá thất bại')
              } finally {
                setQuotationExporting(false)
              }
            }}
          />
        )}

        {/* In Thỏa Thuận Mua Bán */}
        <Button
          className=""
          variant="outline"
          size="sm"
          onClick={async () => {
            const selectedRows = table.getSelectedRowModel().rows
            if (selectedRows.length !== 1) {
              toast.warning('Vui lòng chọn 1 (Một) hóa đơn để in thỏa thuận mua bán')
              return
            }

            const invoiceId = selectedRows[0].original.id
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
          }}
          loading={loading || agreementExporting}
        >
          <IconFileTypePdf className="mr-2 size-4" aria-hidden="true" />
          In Thỏa Thuận Mua Bán
        </Button>

        {agreementData && (
          <AgreementPreviewDialog
            open={showAgreementPreview}
            onOpenChange={(open) => {
              if (!open) {
                setShowAgreementPreview(false)
              }
            }}
            initialData={agreementData}
            onConfirm={async (finalData) => {
              try {
                setAgreementExporting(true)
                await exportAgreementPdf(finalData, agreementFileName)
                toast.success('Đã in thỏa thuận mua bán thành công')
                setShowAgreementPreview(false)
                table.resetRowSelection()
              } catch (error) {
                console.error('Export agreement error:', error)
                toast.error('In thỏa thuận mua bán thất bại')
              } finally {
                setAgreementExporting(false)
              }
            }}
          />
        )}

        {/* In Hợp Đồng Bán Hàng Trả Chậm */}
        <Button
          className=""
          variant="outline"
          size="sm"
          onClick={async () => {
            const selectedRows = table.getSelectedRowModel().rows
            if (selectedRows.length !== 1) {
              toast.warning('Vui lòng chọn 1 (Một) hóa đơn để in hợp đồng trả chậm')
              return
            }

            const invoiceId = selectedRows[0].original.id
            const getAdminInvoice = JSON.parse(
              localStorage.getItem('permissionCodes'),
            ).includes('GET_INVOICE')

            try {
              const data = getAdminInvoice
                ? await getInvoiceDetail(invoiceId)
                : await getInvoiceDetailByUser(invoiceId)

              const baseInstallmentData = buildInstallmentData(data)

              setInstallmentData(baseInstallmentData)
              setInstallmentFileName(`hop-dong-tra-cham-${data.code || 'contract'}.docx`)
              setShowInstallmentPreview(true)
            } catch (error) {
              console.error('Load installment data error:', error)
              toast.error('Không lấy được dữ liệu hợp đồng trả chậm')
            }
          }}
          loading={loading || installmentExporting}
        >
          <IconFileTypePdf className="mr-2 size-4" aria-hidden="true" />
          In Hợp Đồng Bán Hàng Trả Chậm
        </Button>

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
                toast.success('Đã xuất hợp đồng trả chậm thành công')
                setShowInstallmentPreview(false)
                table.resetRowSelection()
              } catch (error) {
                console.error('Export installment error:', error)
                toast.error('Xuất hợp đồng trả chậm thất bại')
              } finally {
                setInstallmentExporting(false)
              }
            }}
          />
        )}

        {/* Tạo phiếu thu */}
        <Can permission={['CREATE_RECEIPT']}>
          <Button
            className=""
            variant="outline"
            size="sm"
            onClick={handleShowCreateReceiptDialog}
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Tạo phiếu thu
          </Button>
        </Can>

        {/* Tạo hợp đồng */}
        <Can permission={['CREATE_SALES_CONTRACT']}>
          <Button
            className=""
            variant="outline"
            size="sm"
            onClick={handleShowCreateSalesContractDialog}
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Tạo Hợp Đồng
          </Button>
        </Can>

        {/* Tạo hóa đơn chung */}
        <Can permission={['CREATE_INVOICE']}>
          <Button
            className=""
            variant="outline"
            size="sm"
            onClick={() => setShowCreateInvoiceDialog(true)}
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </Can>

        {/* Dialog tạo hóa đơn chung */}
        {showCreateInvoiceDialog && (
          <CreateInvoiceDialog
            type="common_invoice"
            open={showCreateInvoiceDialog}
            onOpenChange={setShowCreateInvoiceDialog}
            showTrigger={false}
          />
        )}

        {/* Dialog tạo phiếu thu */}
        {showCreateReceiptDialog && (
          <CreateReceiptDialog
            invoices={selectedInvoices}
            open={showCreateReceiptDialog}
            onOpenChange={setShowCreateReceiptDialog}
            showTrigger={false}
            table={table}
          />
        )}

        {/* Dialog tạo hợp đồng */}
        {showCreateSalesContractDialog && (
          <CreateSalesContractDialog
            invoiceIds={selectedInvoiceIds}
            open={showCreateSalesContractDialog}
            onOpenChange={setShowCreateSalesContractDialog}
            showTrigger={false}
            table={table}
          />
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
