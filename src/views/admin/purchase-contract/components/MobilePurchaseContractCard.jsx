
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical, Eye, Printer, Trash2, Phone, CreditCard, Mail } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { purchaseContractStatuses } from '../data'
import Can from '@/utils/can'
import ViewPurchaseContractDialog from './ViewPurchaseContractDialog'
import LiquidatePurchaseContractDialog from './LiquidatePurchaseContractDialog'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import React from 'react'
import { IconPackageImport, IconPencil, IconTrash, IconReceiptRefund } from '@tabler/icons-react'
import ConfirmImportWarehouseDialog from '@/views/admin/warehouse-receipt/components/ConfirmImportWarehouseDialog'
import { createWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { getPurchaseContracts } from '@/stores/PurchaseContractSlice'
import UpdatePurchaseContractDialog from './UpdatePurchaseContractDialog'
import DeletePurchaseContractDialog from './DeletePurchaseContractDialog'

const MobilePurchaseContractCard = ({
  contract,
  isSelected,
  onSelectChange,
  onRowAction,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showLiquidationDialog, setShowLiquidationDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const dispatch = useDispatch()

  const { supplierName, supplierPhone, supplierIdentityNo, supplierTaxCode, totalAmount, paidAmount, status, code, contractDate, paymentStatus } = contract

  const remainingAmount = parseFloat(totalAmount || 0) - parseFloat(paidAmount || 0)

  const getStatusBadge = (statusValue) => {
    const statusObj = purchaseContractStatuses.find((s) => s.value === statusValue)
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

  // NOTE: Purchase Contract might not have paymentStatuses in data/index.jsx yet
  // If undefined, we can render simple text or omit. 
  // For now I will try to use paymentStatuses if imported, or remove if it fails.
  // Actually, Sales uses `paymentStatuses`. Purchase might not have it defined in `../data`.
  // I will check if I can import it. If not I will define a local map or just show text.
  // `purchase-contract/data/index.jsx` only had statuses.
  // I'll skip payment badge for now or just show text if not available.

  const getDebtStatus = () => {
    // If fully paid
    // Assume paymentStatus logic exists or based on amounts
    if (remainingAmount <= 0) {
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

  return (
    <>
      {/* Dialogs */}
      {showViewDialog && (
        <ViewPurchaseContractDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          purchaseContractId={contract.id}
          showTrigger={false}
          contentClassName="z-[10006]"
          overlayClassName="z-[10005]"
        />
      )}

      {showUpdateDialog && (
        <UpdatePurchaseContractDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          contractId={contract.id}
          onSuccess={() => {
            if (onRowAction) onRowAction()
          }}
        />
      )}

      {showDeleteDialog && (
        <DeletePurchaseContractDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          contractId={contract.id}
          onSuccess={() => {
            if (onRowAction) onRowAction()
          }}
        />
      )}

      {showLiquidationDialog && (
        <LiquidatePurchaseContractDialog
          open={showLiquidationDialog}
          onOpenChange={setShowLiquidationDialog}
          contractId={contract.id}
          onSuccess={() => {
            if (onRowAction) onRowAction()
          }}
        />
      )}

      {showImportDialog && (
        <ConfirmImportWarehouseDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          purchaseContractId={contract.id}
          onConfirm={async (selectedItems) => {
            const payload = {
              code: `NK-${contract.code}-${Date.now().toString().slice(-4)}`,
              receiptType: 1, // IMPORT
              businessType: 'purchase_in',
              receiptDate: new Date().toISOString(),
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
                purchaseOrderId: item.purchaseOrderId || null,
                purchaseOrderItemId: item.purchaseOrderId ? item.id : null,
                purchaseContractItemId: !item.purchaseOrderId ? item.id : null
              }))
            }

            try {
              await dispatch(createWarehouseReceipt(payload)).unwrap()
              toast.success('Tạo phiếu nhập kho thành công')
              dispatch(getPurchaseContracts({}))
              if (onRowAction) onRowAction()
            } catch (error) {
              console.error(error)
            }
          }}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
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
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
                Xem
                <DropdownMenuShortcut>
                  <Eye className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>

              <Can permission={'PURCHASE_CONTRACT_UPDATE'}>
                <DropdownMenuItem
                  onClick={() => {
                    if (onRowAction) onRowAction()
                    setShowUpdateDialog(true)
                  }}
                  className={`text-blue-600 ${status !== 'draft' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={status !== 'draft'}
                >
                  Sửa
                  <DropdownMenuShortcut>
                    <IconPencil className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </Can>

              <Can permission={'WAREHOUSE_IMPORT_CREATE'}>
                <DropdownMenuItem
                  onClick={() => setShowImportDialog(true)}
                  className={`text-emerald-600 ${!['confirmed', 'shipping'].includes(status) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!['confirmed', 'shipping'].includes(status)}
                >
                  Nhập kho
                  <DropdownMenuShortcut>
                    <IconPackageImport className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </Can>

              <Can permission={'PURCHASE_CONTRACT_LIQUIDATE'}>
                <DropdownMenuItem
                  onClick={() => setShowLiquidationDialog(true)}
                  className={`text-orange-600 ${status !== 'confirmed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={status !== 'confirmed'}
                >
                  Thanh lý
                  <DropdownMenuShortcut>
                    <IconReceiptRefund className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </Can>

              <DropdownMenuSeparator />

              <Can permission={'PURCHASE_CONTRACT_DELETE'}>
                <DropdownMenuItem
                  onClick={() => {
                    if (onRowAction) onRowAction()
                    setShowDeleteDialog(true)
                  }}
                  className={`text-red-600 ${status !== 'draft' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={status !== 'draft'}
                >
                  Xóa
                  <DropdownMenuShortcut>
                    <IconTrash className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Supplier Section */}
        <div className="p-3 border-b bg-background/30 space-y-1.5">
          <div className="p-2 rounded">
            <div className="text-sm font-medium truncate">{supplierName}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <a href={`tel:${supplierPhone}`}>{supplierPhone || '---'}</a>
            </div>
            {supplierIdentityNo && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                {supplierIdentityNo}
              </div>
            )}
            {supplierTaxCode && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                MST: {supplierTaxCode}
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
                  <span className="text-muted-foreground">Người tạo:</span>
                  <span className="font-medium">{contract.createdByUser.fullName}</span>
                </div>
                {contract.createdByUser.phone && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>SĐT: <a href={`tel:${contract.createdByUser.phone}`} className="hover:underline">{contract.createdByUser.phone}</a></span>
                  </div>
                )}
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

export default MobilePurchaseContractCard
