import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical, Eye, Pencil, Trash2, Phone, CreditCard } from 'lucide-react'
import { IconFileTypePdf } from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { statuses, paymentStatuses } from '../data'
import Can from '@/utils/can'
import DeleteInvoiceDialog from './DeleteInvoiceDialog'
import InvoiceDialog from './InvoiceDialog'
import ViewInvoiceDialog from './ViewInvoiceDialog'
import UpdateInvoiceStatusDialog from './UpdateInvoiceStatusDialog'
import { useDispatch, useSelector } from 'react-redux'
import { updateInvoiceStatus } from '@/stores/InvoiceSlice'
import { updateSalesContract } from '@/stores/SalesContractSlice'
import { toast } from 'sonner'
import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'
import PrintInvoiceView from './PrintInvoiceView'
import AgreementPreviewDialog from './AgreementPreviewDialog'
import InstallmentPreviewDialog from './InstallmentPreviewDialog'
import { buildAgreementData } from '../helpers/BuildAgreementData'
import { buildInstallmentData } from '../helpers/BuildInstallmentData'
import { exportAgreementPdf } from '../helpers/ExportAgreementPdfV2'
import { exportInstallmentWord } from '../helpers/ExportInstallmentWord'
import { IconPlus, IconPackageExport, IconCheck, IconPackage } from '@tabler/icons-react'
import CreateReceiptDialog from '../../receipt/components/CreateReceiptDialog'
import CreateSalesContractDialog from '../../sales-contract/components/CreateSalesContractDialog'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'

import { createWarehouseReceipt, postWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { getInvoices } from '@/stores/InvoiceSlice'
import { getStartOfCurrentMonth, getEndOfCurrentMonth } from '@/utils/date-format'

const MobileInvoiceCard = ({
  invoice,
  isSelected,
  onSelectChange,
  onRowAction,
}) => {
  const dispatch = useDispatch()
  const setting = useSelector((state) => state.setting.setting)
  const [expanded, setExpanded] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

  // Print states
  const [printInvoice, setPrintInvoice] = useState(null)
  const [showAgreementPreview, setShowAgreementPreview] = useState(false)
  const [agreementData, setAgreementData] = useState(null)
  const [agreementFileName, setAgreementFileName] = useState('thoa-thuan-mua-ban.pdf')
  const [agreementExporting, setAgreementExporting] = useState(false)
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-tra-cham.docx')
  const [installmentExporting, setInstallmentExporting] = useState(false)

  // New actions state
  const [showCreateReceiptDialog, setShowCreateReceiptDialog] = useState(false)
  const [showCreateSalesContractDialog, setShowCreateSalesContractDialog] = useState(false)
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)
  const [warehouseLoading, setWarehouseLoading] = useState(false)





  const { customer, amount, discount, taxAmount, status, paymentStatus, code, createdAt } = invoice

  // Logic copied from UpdateInvoiceStatusDialog
  const isPaid = paymentStatus === 'paid'
  const isLocked = ['delivered', 'rejected'].includes(status)
  const isActionDisabled = isPaid || isLocked

  const filteredStatuses = useMemo(() => {
    const permissions = JSON.parse(localStorage.getItem('permissionCodes') || '[]')
    const canReject = permissions.includes('REJECT_INVOICE')
    const canRevert = permissions.includes('REVERT_INVOICE')

    return statuses.filter((s) => {
      // Hide 'completed' status as it is automated
      if (s.value === 'delivered') return false

      // Permission check for 'rejected'
      if (s.value === 'rejected') {
        if (!canReject) return false
        // Only allow switching to 'rejected' if current status is 'pending'
        if (status !== 'pending') return false
      }

      // Permission check for 'pending' (revert)
      if (s.value === 'pending') {
        if (!canRevert) return false
      }

      return true
    })
  }, [status])

  const selectedStatusObj = statuses.find((s) => s.value === status)

  const getStatusBadge = (statusValue) => {
    const statusObj = statuses.find((s) => s.value === statusValue)
    // Extract text color from color class string if possible, or use explicit mapping
    // Assuming statusObj.color might look like "bg-green-100 text-green-700"
    // We want just "text-green-700" or similar.
    // For now, let's use a mapping based on value if data doesn't have partials.
    // Or we can just use the provided color class but override background?
    // "bg-green-100" will show background.
    // Let's assume I need to find the text color.

    let textColor = "text-gray-600"
    return (
      <div
        className={`cursor-pointer inline-flex items-center gap-1 font-medium text-xs ${statusObj?.textColor || 'text-gray-600'}`}
        onClick={() => setShowUpdateStatusDialog(true)}
      >
        {statusObj?.icon ? <statusObj.icon className="h-3 w-3" /> : null}
        {statusObj?.label || 'Không xác định'}
      </div>
    )
  }

  const getPaymentStatusBadge = (paymentStatusValue) => {
    const paymentStatusObj = paymentStatuses.find(
      (s) => s.value === paymentStatusValue
    )
    return (
      <Badge variant="outline" className={`${paymentStatusObj?.color} border-0`}>
        <span className="mr-1 inline-flex h-3 w-3 items-center justify-center">
          {paymentStatusObj?.icon ? (
            <paymentStatusObj.icon className="h-3 w-3" />
          ) : null}
        </span>
        {paymentStatusObj?.label || 'Không xác định'}
      </Badge>
    )
  }

  const getDebtStatus = (invoice) => {
    const paymentStatus = invoice?.paymentStatus
    const totalAmount = parseFloat(invoice?.totalAmount || 0)
    const paidAmount = parseFloat(invoice?.paidAmount || 0)
    const remainingAmount = totalAmount - paidAmount

    // If fully paid
    if (paymentStatus === 'paid' || remainingAmount <= 0) {
      return <span className="text-xs text-green-500 font-medium">✓ Thanh toán toàn bộ</span>
    }

    // If partially paid
    if (paidAmount > 0 && remainingAmount > 0) {
      return (
        <span className="text-xs text-yellow-600 font-medium">
          Còn nợ: {moneyFormat(remainingAmount)}
        </span>
      )
    }

    // If not paid at all
    if (paidAmount === 0) {
      return (
        <span className="text-xs text-red-500 font-medium">
          Còn nợ: {moneyFormat(remainingAmount)}
        </span>
      )
    }

    return <span className="text-xs text-muted-foreground">Chưa có phiếu thu</span>
  }

  const isDuplicate = invoice?.creditNotes?.length > 0

  const handleStatusUpdate = async (nextStatus) => {
    try {
      await dispatch(
        updateInvoiceStatus({ id: invoice.id, status: nextStatus }),
      ).unwrap()
      toast.success('Cập nhật trạng thái hóa đơn thành công')
      setShowUpdateStatusDialog(false)
    } catch (error) {
      console.log('Submit error: ', error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  // ===== NEW ACTION HANDLERS =====
  const handleCreateReceipt = () => {
    if (invoice?.status === 'paid' || invoice?.status === 'rejected') {
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

  const handleConfirmCreateWarehouseReceipt = async (selectedItems) => {
    const invoiceId = invoice.id
    if (!invoiceId) return

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
          content: `Xuất kho theo đơn bán ${invoice.code}`,
          salesContractId: invoice.salesContractId,
          salesContractItemId: item.salesContractItemId
        }))

      if (selectedDetails.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm')
        return
      }

      const payload = {
        code: `XK-${invoice.code}-${Date.now().toString().slice(-4)}`,
        receiptType: 2, // ISSUE
        businessType: 'sale_out',
        receiptDate: new Date().toISOString(),
        reason: `Xuất kho cho đơn bán ${invoice.code}`,
        note: invoice.note || 'Xuất kho từ hóa đơn',
        warehouseId: null,
        customerId: invoice.customerId,
        salesContractId: invoice.salesContractId,
        invoiceId: invoice.id,
        details: selectedDetails
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Đã tạo phiếu xuất kho thành công')

      // Refresh invoice list
      await dispatch(
        getInvoices({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
    } catch (error) {
      console.error('Create warehouse receipt error:', error)
      toast.error('Tạo phiếu xuất kho thất bại')
    } finally {
      setWarehouseLoading(false)
      setShowConfirmWarehouseDialog(false)
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
      {/* Dialogs */}
      {showViewDialog && (
        <ViewInvoiceDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          invoiceId={invoice.id}
          showTrigger={false}
          onEdit={() => {
            setShowViewDialog(false)
            setTimeout(() => setShowUpdateDialog(true), 100)
          }}
        />
      )}

      {showUpdateDialog && (
        <InvoiceDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          invoiceId={invoice.id}
          showTrigger={false}
        />
      )}

      {showDeleteDialog && (
        <DeleteInvoiceDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          invoice={invoice}
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

      <div className="border rounded-lg bg-card mb-3 overflow-hidden">
        {/* Header - Always Visible */}
        <div className="p-3 border-b bg-background/50 flex items-center gap-2">
          {/* Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectChange}
            className="h-4 w-4"
          />

          {/* Code & Date */}
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm truncate text-primary cursor-pointer hover:underline"
              onClick={() => setShowViewDialog(true)}
            >
              {code}
            </div>
            <div className="text-xs text-muted-foreground">{dateFormat(createdAt)}</div>
          </div>

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setShowViewDialog(true)} className="text-slate-600">
                <Eye className="mr-2 h-4 w-4" />
                Xem
              </DropdownMenuItem>

              {status !== 'accepted' && (
                <Can permission="CREATE_INVOICE">
                  <DropdownMenuItem onClick={() => setShowUpdateDialog(true)} className="text-blue-600">
                    <Pencil className="mr-2 h-4 w-4" />
                    Sửa
                  </DropdownMenuItem>
                </Can>
              )}

              <DropdownMenuSeparator />

              {/* In Hóa Đơn */}
              <DropdownMenuItem onClick={handlePrintInvoice} className="text-purple-600">
                <IconFileTypePdf className="mr-2 h-4 w-4" />
                In HĐ
              </DropdownMenuItem>

              {/* In Thỏa Thuận Mua Bán */}
              <DropdownMenuItem onClick={handlePrintAgreement} className="text-purple-600">
                <IconFileTypePdf className="mr-2 h-4 w-4" />
                In Thỏa Thuận
              </DropdownMenuItem>

              {/* In Hợp Đồng Bán Hàng */}
              <DropdownMenuItem onClick={handlePrintInstallment} className="text-purple-600">
                <IconFileTypePdf className="mr-2 h-4 w-4" />
                In Hợp Đồng
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Create Receipt */}
              {(invoice?.status === 'accepted' || invoice?.status === 'delivered') && (
                <Can permission="RECEIPT_CREATE">
                  <DropdownMenuItem onClick={handleCreateReceipt} className="text-emerald-600">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Tạo Phiếu Thu
                  </DropdownMenuItem>
                </Can>
              )}

              {/* Create Sales Contract */}
              {invoice?.status === 'accepted' && !invoice?.salesContract && (
                <Can permission="SALES_CONTRACT_CREATE">
                  <DropdownMenuItem onClick={handleCreateSalesContract} className="text-indigo-600">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Tạo Hợp Đồng
                  </DropdownMenuItem>
                </Can>
              )}

              <DropdownMenuSeparator />

              {/* Warehouse Actions */}
              {invoice?.status === 'accepted' && !invoice?.warehouseReceiptId && (
                <Can permission="WAREHOUSE_EXPORT_CREATE">
                  <DropdownMenuItem
                    onClick={handleCreateWarehouseReceipt}
                    className="text-orange-600"
                  >
                    <IconPackageExport className="mr-2 h-4 w-4" />
                    Tạo Phiếu Xuất Kho
                  </DropdownMenuItem>
                </Can>
              )}

              {/* {invoice?.warehouseReceipt?.status === 'DRAFT' && (
                <Can permission="CREATE_INVOICE">
                  <DropdownMenuItem
                    onClick={handlePostWarehouseReceipt}
                    className="text-orange-600"
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    Ghi Sổ Kho
                  </DropdownMenuItem>
                </Can>
              )} */}

              {invoice?.warehouseReceiptId && (
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Phiếu kho: ${invoice?.warehouseReceipt?.code || invoice?.warehouseReceiptId}`)
                  }}
                  className="text-orange-600"
                >
                  <IconPackage className="mr-2 h-4 w-4" />
                  Xem Phiếu Kho
                </DropdownMenuItem>
              )}

              <Can permission="DELETE_INVOICE">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>


        </div>

        {/* Customer Section */}
        <div className="p-3 border-b bg-background/30 space-y-1.5">
          <div className={cn(isDuplicate && 'bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded')}>
            <div className="text-sm font-medium truncate">{customer?.name}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {customer?.phone}
            </div>
            {customer?.taxCode && (
              <div className="text-xs text-muted-foreground">MST: {customer?.taxCode}</div>
            )}
            {customer?.identityCard && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                {customer?.identityCard}
              </div>
            )}
            {isDuplicate && (
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                ⚠ {invoice?.creditNotes?.length} HĐ điều chỉnh
              </div>
            )}
          </div>
        </div>

        {/* Amount Section */}
        <div className="p-3 border-b bg-background/30 space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">Tổng tiền:</span>
            <span className="text-sm font-semibold text-primary">{moneyFormat(amount)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-start">
              <span className="text-xs text-muted-foreground">Giảm giá:</span>
              <span className="text-xs text-red-500">-{moneyFormat(discount)}</span>
            </div>
          )}
        </div>

        {/* Status & Debt Section */}
        <div className="p-3 border-b bg-background/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Trạng thái:</span>

            <div className="w-[140px]">
              <Select
                value={status}
                onValueChange={handleStatusUpdate}
                disabled={isActionDisabled}
              >
                <SelectTrigger className="h-7 text-xs px-2">
                  <SelectValue placeholder="Chọn trạng thái">
                    {selectedStatusObj ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-medium",
                          invoice.status === 'delivered'
                            ? "text-green-600"
                            : selectedStatusObj.textColor || selectedStatusObj.color || ''
                        )}
                      >
                        {selectedStatusObj.icon ? (
                          <selectedStatusObj.icon className="h-3 w-3" />
                        ) : null}
                        {selectedStatusObj.label}
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" align="end" className="w-[140px] z-[10005]">
                  {filteredStatuses.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className="cursor-pointer text-xs"
                    >
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${s.textColor || s.color || ''
                          }`}
                      >
                        {s.icon ? <s.icon className="h-3 w-3" /> : null}
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Thanh toán:</span>
            {getPaymentStatusBadge(paymentStatus || 'unpaid')}
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">Công nợ:</span>
            <div>{getDebtStatus(invoice)}</div>
          </div>
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="p-3 bg-muted/30 space-y-2 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Thuế:</span>
              <span className="font-medium">{moneyFormat(taxAmount)}</span>
            </div>

            {invoice?.invoiceRevenueShare && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Chia doanh số:</span>
                  <span className="font-medium">{invoice?.invoiceRevenueShare?.user?.fullName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Số tiền chia:</span>
                  <span className="font-medium text-green-600">
                    {moneyFormat(invoice?.invoiceRevenueShare?.amount || 0)}
                  </span>
                </div>
              </>
            )}

            {invoice?.note && (
              <div className="flex justify-between text-xs pt-2 border-t">
                <span className="text-muted-foreground">Ghi chú:</span>
                <a
                  href={invoice.note}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline truncate"
                >
                  Xem
                </a>
              </div>
            )}
          </div>
        )}

        {showViewDialog && (
          <ViewInvoiceDialog
            open={showViewDialog}
            onOpenChange={setShowViewDialog}
            invoiceId={invoice.id}
            showTrigger={false}
            onEdit={() => {
              setShowViewDialog(false)
              setTimeout(() => {
                setShowUpdateDialog(true)
              }, 100)
            }}
          />
        )}

        {showUpdateDialog && (
          <InvoiceDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            invoiceId={invoice.id}
            showTrigger={false}
          />
        )}

        {showDeleteDialog && (
          <DeleteInvoiceDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            invoice={invoice}
            showTrigger={false}
          />
        )}

        {showUpdateStatusDialog && (
          <UpdateInvoiceStatusDialog
            open={showUpdateStatusDialog}
            onOpenChange={setShowUpdateStatusDialog}
            invoiceId={invoice.id}
            currentStatus={status}
            statuses={statuses}
            onSubmit={handleStatusUpdate}
          />
        )}

        {/* Print Invoice Dialog */}
        {printInvoice && setting && (
          <PrintInvoiceView
            invoice={printInvoice}
            setting={setting}
            onAfterPrint={() => setPrintInvoice(null)}
          />
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

                // Save data if status is 'draft'
                if (finalData.status === 'draft' && finalData.salesContractId) {
                  const payload = {
                    code: finalData.contract?.no,
                    sellerName: finalData.seller?.name,
                    sellerRepresentative: finalData.seller?.representative,
                    sellerAddress: finalData.seller?.address,
                    sellerPhone: finalData.seller?.phone,
                    customerName: finalData.customer?.name,
                    customerPhone: finalData.customer?.phone,
                    customerAddress: finalData.customer?.address,
                    customerIdentityCard: finalData.customer?.identityCard,
                    customerIdentityDate: finalData.customer?.identityDate,
                    customerIdentityPlace: finalData.customer?.identityPlace,
                    deliveryDate: finalData.payment?.deliveryDate,
                  }

                  await dispatch(updateSalesContract({
                    id: finalData.salesContractId,
                    data: payload
                  })).unwrap()

                  toast.success('Đã lưu thông tin hợp đồng')
                }

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
      </div>
    </>
  )
}

export default MobileInvoiceCard

