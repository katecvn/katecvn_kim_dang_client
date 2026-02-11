
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical, Eye, Phone, CreditCard, Mail } from 'lucide-react'
import { IconFileTypePdf, IconPencil, IconPackageExport, IconArchive, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { statuses, paymentStatuses } from '../data'
import Can from '@/utils/can'
import ViewSalesContractDialog from './ViewSalesContractDialog'
import LiquidateContractDialog from './LiquidateContractDialog'
import UpdateSalesContractDialog from './UpdateSalesContractDialog'
import DeleteSalesContractDialog from './DeleteSalesContractDialog'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'
import { createWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { getSalesContracts } from '@/stores/SalesContractSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { getSalesContractDetail } from '@/stores/SalesContractSlice'
import InstallmentPreviewDialog from '../../invoice/components/InstallmentPreviewDialog'
import { buildInstallmentData } from '../../invoice/helpers/BuildInstallmentData'
import { exportInstallmentWord } from '../../invoice/helpers/ExportInstallmentWord'
import React from 'react'
import { MobileIcon } from '@radix-ui/react-icons'

const MobileSalesContractCard = ({
  contract,
  isSelected,
  onSelectChange,
  onRowAction,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showLiquidationDialog, setShowLiquidationDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)
  const [warehouseLoading, setWarehouseLoading] = useState(false)
  const [dialogData, setDialogData] = useState(null)

  // Print states
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-ban-hang.docx')
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentExporting, setInstallmentExporting] = useState(false)

  const dispatch = useDispatch()

  const { buyerName, buyerPhone, buyerIdentityNo, paymentStatus, totalAmount, paidAmount, status, code, contractDate } = contract

  // Permissions
  const canEdit = status === 'draft'
  const canDelete = status === 'draft'

  const remainingAmount = parseFloat(totalAmount || 0) - parseFloat(paidAmount || 0)

  const getStatusBadge = (statusValue) => {
    const statusObj = statuses.find((s) => s.value === statusValue)
    return (
      <Badge
        variant="outline"
        className={`cursor-pointer ${statusObj?.color}`}
      >
        <span className="mr-1 inline-flex h-3 w-3 items-center justify-center">
          {statusObj?.icon ? React.createElement(statusObj.icon, { className: 'h-3 w-3' }) : null}
        </span>
        {statusObj?.label || 'Không xác định'}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (paymentStatusValue) => {
    const paymentStatusObj = paymentStatuses.find(
      (s) => s.value === paymentStatusValue
    )
    return (
      <Badge variant="outline" className={paymentStatusObj?.color}>
        <span className="mr-1 inline-flex h-3 w-3 items-center justify-center">
          {paymentStatusObj?.icon ? React.createElement(paymentStatusObj.icon, { className: 'h-3 w-3' }) : null}
        </span>
        {paymentStatusObj?.label || 'Không xác định'}
      </Badge>
    )
  }

  const getDebtStatus = () => {
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
    if (!paidAmount || paidAmount === 0) {
      return (
        <span className="text-xs text-red-500 font-medium">
          Còn nợ: {moneyFormat(remainingAmount)}
        </span>
      )
    }

    return <span className="text-xs text-muted-foreground">Chưa thanh toán</span>
  }

  const handlePrintContract = async () => {
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
      const contractDetail = await dispatch(getSalesContractDetail(contract.id)).unwrap()

      const mappedItems = contractDetail?.items?.map(item => ({
        id: item.id,
        productName: item.product?.name,
        quantity: item.quantity,
        unitName: item.unit?.name,
        salesContractItemId: item.id,
      })) || []

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

  const handleConfirmCreateWarehouseReceipt = async (selectedItems) => {
    const firstInvoice = contract.invoices?.[0]
    if (!firstInvoice) return

    try {
      setWarehouseLoading(true)

      const selectedDetails = selectedItems.map(item => ({
        productId: item.productId || item.id,
        unitId: item.unitId || item.unit?.id,
        movement: 'out',
        qtyActual: item.quantity,
        unitPrice: item.unitPrice || 0,
        content: `Xuất kho theo HĐ ${contract.code}`,
        salesContractId: contract.id,
        salesContractItemId: item.salesContractItemId
      }))

      if (selectedDetails.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm')
        return
      }

      const payload = {
        code: `XK-${contract.code}-${Date.now().toString().slice(-4)}`,
        receiptType: 2,
        businessType: 'sale_out',
        receiptDate: new Date().toISOString(),
        reason: `Xuất kho cho HĐ ${contract.code}`,
        note: contract.note || '',
        warehouseId: null,
        customerId: contract.customerId,
        salesContractId: contract.id,
        details: selectedDetails
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Đã tạo phiếu xuất kho thành công')

      if (onRowAction) onRowAction()
    } catch (error) {
      console.error('Create warehouse receipt error:', error)
      toast.error('Tạo phiếu xuất kho thất bại')
    } finally {
      setWarehouseLoading(false)
    }
  }

  return (
    <>
      {/* Dialogs */}
      {showViewDialog && (
        <ViewSalesContractDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          contractId={contract.id}
          showTrigger={false}
          contentClassName="z-[10006]"
          overlayClassName="z-[10005]"
        />
      )}

      {showLiquidationDialog && (
        <LiquidateContractDialog
          open={showLiquidationDialog}
          onOpenChange={setShowLiquidationDialog}
          contractId={contract.id}
          contentClassName="z-[10006]"
          overlayClassName="z-[10005]"
          onSuccess={() => {
            if (onRowAction) onRowAction()
          }}
        />
      )}

      {installmentData && (
        <InstallmentPreviewDialog
          open={showInstallmentPreview}
          onOpenChange={setShowInstallmentPreview}
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
            <div className="text-xs text-muted-foreground">{dateFormat(contractDate)}</div>
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
              <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handlePrintContract} className="text-orange-600">
                <IconFileTypePdf className="mr-2 h-4 w-4" />
                In Hợp Đồng
              </DropdownMenuItem>

              {/* <Can permission={'UPDATE_SALES_CONTRACT'}>
                <DropdownMenuItem
                  onClick={() => setShowUpdateDialog(true)}
                  className={`text-blue-600 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canEdit}
                >
                  <IconPencil className="mr-2 h-4 w-4" />
                  Sửa
                </DropdownMenuItem>
              </Can> */}

              <Can permission={'CREATE_INVOICE'}>
                <DropdownMenuItem
                  onClick={handleCreateWarehouseReceipt}
                  disabled={warehouseLoading || !contract.invoices?.[0] || contract.invoices?.[0]?.warehouseReceipts?.length > 0}
                  className="text-blue-600"
                >
                  <IconPackageExport className="mr-2 h-4 w-4" />
                  Xuất kho
                </DropdownMenuItem>
              </Can>

              {status === 'confirmed' && (
                <DropdownMenuItem onClick={() => setShowLiquidationDialog(true)} className="text-orange-600">
                  <IconArchive className="mr-2 h-4 w-4" />
                  Thanh Lý
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <Can permission={'SALES_CONTRACT_DELETE'}>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className={`text-red-600 ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canDelete}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Customer Section */}
        <div className="p-3 border-b bg-background/30 space-y-1.5">
          <div className="p-2 rounded">
            <div className="text-sm font-medium truncate">{buyerName}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <a href={`tel:${buyerPhone}`}>{buyerPhone || '---'}</a>
            </div>
            {buyerIdentityNo && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                {buyerIdentityNo}
              </div>
            )}
          </div>
        </div>

        {/* Amount Section */}
        <div className="p-3 border-b bg-background/30 space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">Tổng giá trị:</span>
            <span className="text-sm font-semibold text-primary">{moneyFormat(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">Đã thanh toán:</span>
            <span className="text-xs text-green-600 font-medium">{moneyFormat(paidAmount || 0)}</span>
          </div>
        </div>

        {/* Status & Debt Section */}
        <div className="p-3 border-b bg-background/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Trạng thái:</span>
            {getStatusBadge(status)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Thanh toán:</span>
            {contract.invoices?.[0] ? (
              getPaymentStatusBadge(contract.invoices[0].paymentStatus || 'unpaid')
            ) : (
              <span className="text-muted-foreground text-xs">—</span>
            )}
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">Công nợ:</span>
            <div>{getDebtStatus()}</div>
          </div>
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="p-3 bg-muted/30 space-y-2 border-t">
            {/* Staff Info */}
            {contract?.createdByUser && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">NV bán hàng:</span>
                  <span className="font-medium">{contract.createdByUser.fullName}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>SĐT: <a href={`tel:${contract.createdByUser.phone}`} className="hover:underline">{contract.createdByUser.phone}</a></span>
                </div>
              </div>
            )}

            {/* Note */}
            {contract?.note && (
              <div className="flex justify-between text-xs pt-2 border-t">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span className="truncate max-w-[200px]">{contract.note}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default MobileSalesContractCard
