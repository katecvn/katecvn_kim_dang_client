import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { getSalesContractDetail } from '@/stores/SalesContractSlice'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { Button } from '@/components/custom/Button'
import { statuses, paymentStatuses } from '../data'
import { statuses as invoiceStatuses } from '@/views/admin/invoice/data'
import { useDispatch } from 'react-redux'
import { Separator } from '@/components/ui/separator'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import { PlusIcon, MobileIcon } from '@radix-ui/react-icons'
import { Mail, MapPin, CreditCard, Printer, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'
import ViewInvoiceDialog from '@/views/admin/invoice/components/ViewInvoiceDialog'
import InvoiceDialog from '@/views/admin/invoice/components/InvoiceDialog'
import { buildInstallmentData } from '../../invoice/helpers/BuildInstallmentData'
import InstallmentPreviewDialog from '../../invoice/components/InstallmentPreviewDialog'
import LiquidateContractDialog from './LiquidateContractDialog'
import DeleteSalesContractDialog from './DeleteSalesContractDialog'
import { exportInstallmentWord } from '../../invoice/helpers/ExportInstallmentWord'
import { Package } from 'lucide-react'
import { getPublicUrl } from '@/utils/file'
import ViewProductDialog from '../../product/components/ViewProductDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateInvoiceStatus } from '@/stores/InvoiceSlice'
import ViewWarehouseReceiptDialog from '../../warehouse-receipt/components/ViewWarehouseReceiptDialog'
import {
  updateWarehouseReceipt,
  cancelWarehouseReceipt,
  postWarehouseReceipt,
  createWarehouseReceipt,
} from '@/stores/WarehouseReceiptSlice'
import { UpdateWarehouseReceiptStatusDialog } from '../../warehouse-receipt/components/UpdateWarehouseReceiptStatusDialog'
import UpdateInvoiceStatusDialog from '../../invoice/components/UpdateInvoiceStatusDialog'
import { DeleteWarehouseReceiptDialog } from '../../warehouse-receipt/components/DeleteWarehouseReceiptDialog'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'
import CreateReceiptDialog from '@/views/admin/receipt/components/CreateReceiptDialog'
import { warehouseReceiptStatuses } from '../../warehouse-receipt/data'
import { receiptStatus } from '../../receipt/data' // Corrected path based on previous check, wait. ViewInvoice said ../../receipt/data. I need to be careful.
import { updateReceiptStatus, getReceiptQRCode } from '@/stores/ReceiptSlice'
import ViewReceiptDialog from '@/views/admin/receipt/components/ViewReceiptDialog'
import PaymentQRCodeDialog from '@/views/admin/receipt/components/PaymentQRCodeDialog'
import { DeleteReceiptDialog } from '../../receipt/components/DeleteReceiptDialog'
import UpdateReceiptStatusDialog from '../../receipt/components/UpdateReceiptStatusDialog'
import { IconPencil, IconCheck, IconFileText, IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import { Trash2, QrCode } from 'lucide-react'
import { toast } from 'sonner'

const ViewSalesContractDialog = ({
  open,
  onOpenChange,
  contractId,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const dispatch = useDispatch()
  const [contract, setContract] = useState({})
  const [loading, setLoading] = useState(false)
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [selectedInvoiceIdForUpdate, setSelectedInvoiceIdForUpdate] = useState(null)
  // Invoice Update Logic
  const [showUpdateInvoiceDialog, setShowUpdateInvoiceDialog] = useState(false)
  const [invoiceToUpdateStatus, setInvoiceToUpdateStatus] = useState(null)
  const [showUpdateInvoiceStatusDialog, setShowUpdateInvoiceStatusDialog] = useState(false)

  // View Warehouse Receipt Logic
  const [showViewWarehouseReceiptDialog, setShowViewWarehouseReceiptDialog] = useState(false)
  const [selectedWarehouseReceiptId, setSelectedWarehouseReceiptId] = useState(null)

  // Update/Delete Warehouse Receipt Logic
  const [selectedWarehouseReceipt, setSelectedWarehouseReceipt] = useState(null)
  const [showUpdateWarehouseReceiptStatus, setShowUpdateWarehouseReceiptStatus] = useState(false)
  const [warehouseReceiptToDelete, setWarehouseReceiptToDelete] = useState(null)
  const [showDeleteWarehouseReceiptDialog, setShowDeleteWarehouseReceiptDialog] = useState(false)

  // Payment Voucher (Receipt) Logic
  const [showViewReceiptDialog, setShowViewReceiptDialog] = useState(false)
  const [selectedReceiptId, setSelectedReceiptId] = useState(null)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [showUpdateReceiptStatus, setShowUpdateReceiptStatus] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState(null)
  const [showDeleteReceiptDialog, setShowDeleteReceiptDialog] = useState(false)

  // Liquidation State
  const [showLiquidationDialog, setShowLiquidationDialog] = useState(false)

  // Delete State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Print Contract State
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-ban-hang.docx')
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentExporting, setInstallmentExporting] = useState(false)

  // View Product Dialog
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const handlePrintContract = async () => {
    // Chỉ cho phép in khi status = 'confirmed' (Đã xác nhận)
    // if (contract.status !== 'confirmed') {
    //   toast.warning('Chỉ có thể in hợp đồng khi trạng thái là "Đã xác nhận"')
    //   return
    // }

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

  // Invoice status update logic
  const handleUpdateStatus = async (status, invoiceId) => {
    try {
      await dispatch(updateInvoiceStatus({ id: invoiceId, status })).unwrap()
      toast.success('Cập nhật trạng thái hóa đơn thành công')
      fetchContractDetail() // Refresh data
    } catch (error) {
      console.log('Update status error: ', error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  // Warehouse Receipt Handlers
  const handleUpdateWarehouseReceiptStatus = async (newStatus, id) => {
    try {
      if (newStatus === 'cancelled') {
        await dispatch(cancelWarehouseReceipt(id)).unwrap()
      } else if (newStatus === 'posted') {
        await dispatch(postWarehouseReceipt(id)).unwrap()
      } else {
        await dispatch(updateWarehouseReceipt({ id, data: { status: newStatus } })).unwrap()
      }

      toast.success(newStatus === 'cancelled' ? 'Hủy phiếu thành công' : newStatus === 'posted' ? 'Duyệt phiếu thành công' : 'Cập nhật trạng thái thành công')
      setShowUpdateWarehouseReceiptStatus(false)
      fetchContractDetail()
    } catch (error) {
      console.error(error)
      // toast.error('Cập nhật trạng thái phiếu xuất kho thất bại')
    }
  }

  const getWarehouseReceiptStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'posted': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Receipt Helpers
  const getReceiptStatusColor = (status) => {
    const s = receiptStatus.find((item) => item.value === status)
    return s ? s.color : 'text-gray-500 bg-gray-100'
  }

  const getReceiptStatusObj = (status) => {
    return receiptStatus.find((s) => s.value === status)
  }

  const handleOpenReceiptDetail = (voucher) => {
    setSelectedReceiptId(voucher.id)
    setShowViewReceiptDialog(true)
  }

  const handleUpdateReceiptStatus = async (status, id) => {
    try {
      await dispatch(updateReceiptStatus({ id, status })).unwrap()
      toast.success('Cập nhật trạng thái phiếu thu thành công')
      fetchContractDetail()
    } catch (error) {
      console.error(error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const [showQrDialog, setShowQrDialog] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)

  const handleGenerateQR = async (voucher) => {
    if (!voucher?.id) return
    try {
      const res = await dispatch(getReceiptQRCode(voucher.id)).unwrap()
      if (res?.qrLink) {
        setQrCodeData(res)
        setShowQrDialog(true)
      } else {
        toast.warning('Không tạo được mã QR')
      }
    } catch (error) {
      toast.error('Lỗi khi tạo mã QR')
    }
  }


  const [showCreateReceiptDialog, setShowCreateReceiptDialog] = useState(false)
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)
  const [warehouseLoading, setWarehouseLoading] = useState(false)
  const [warehouseDialogData, setWarehouseDialogData] = useState(null)

  const handleCreateReceipt = () => {
    // Check if contract has invoices
    if (!contract?.invoices || contract.invoices.length === 0) {
      toast.warning('Hợp đồng chưa có hóa đơn để tạo phiếu thu')
      return
    }
    setShowCreateReceiptDialog(true)
  }

  const handleCreateWarehouseReceipt = async () => {
    if (!contract?.invoices || contract.invoices.length === 0) {
      toast.warning('Hợp đồng chưa có hóa đơn để tạo phiếu xuất kho')
      return
    }

    const firstInvoice = contract.invoices[0]
    if (firstInvoice.warehouseReceipts?.length > 0) {
      toast.warning('Hóa đơn này đã có phiếu xuất kho')
      return
    }

    try {
      setWarehouseLoading(true)
      // Fetch contract detail to ensure we have items and warehouse receipts
      const contractDetail = await dispatch(getSalesContractDetail(contractId)).unwrap()

      // Map contract details to invoice items structure for the dialog
      const mappedItems = contractDetail?.items?.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name,
        quantity: item.quantity,
        unitName: item.unit?.name,
        unitId: item.unitId,
        salesContractItemId: item.id, // Mark as contract item
        price: item.unitPrice,
      })) || []

      // Construct object data for dialog
      setWarehouseDialogData({
        ...firstInvoice,
        code: contractDetail.code,
        customer: contract.customer,
        invoiceItems: mappedItems,
        warehouseReceipts: contractDetail.warehouseReceipts || [] // Pass warehouse receipts from contract
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
    // Use the first invoice as context for now, or finding the relevant one
    // This logic might need refinement if multiple invoices exist
    const invoice = contract.invoices[0]
    if (!invoice) return

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
        code: `XK-${contract.code}-${Date.now().toString().slice(-4)}`,
        receiptType: 2, // ISSUE
        businessType: 'sale_out',
        receiptDate: new Date().toISOString(),
        reason: `Xuất kho cho HĐ ${contract.code}`,
        note: contract.note || '',
        warehouseId: null,
        customerId: contract.customerId,
        salesContractId: contract.id,
        // invoiceId: invoice.id, // Removed to match DataTableRowAction logic
        details: selectedDetails
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Đã tạo phiếu xuất kho thành công')

      // Refresh data
      fetchContractDetail()
    } catch (error) {
      console.error('Create warehouse receipt error:', error)
      toast.error('Tạo phiếu xuất kho thất bại')
    } finally {
      setWarehouseLoading(false)
      setShowConfirmWarehouseDialog(false)
    }
  }

  const getFilteredStatuses = (invoice) => {
    if (!invoice) return []
    const permissions = JSON.parse(localStorage.getItem('permissionCodes') || '[]')
    const canReject = permissions.includes('REJECT_INVOICE')
    const canRevert = permissions.includes('REVERT_INVOICE')

    return invoiceStatuses.filter((s) => {
      // Hide 'completed' status as it is automated
      if (s.value === 'delivered') return false

      // Permission check for 'rejected'
      if (s.value === 'rejected') {
        if (!canReject) return false
        // Only allow switching to 'rejected' if current status is 'pending'
        if (invoice.status !== 'pending') return false
      }

      // Permission check for 'pending' (revert)
      if (s.value === 'pending') {
        if (!canRevert) return false
      }

      return true
    })
  }

  useEffect(() => {
    if (contractId && open) {
      fetchContractDetail()
    }
  }, [contractId, open])

  const fetchContractDetail = async () => {
    setLoading(true)
    try {
      const result = await dispatch(getSalesContractDetail(contractId)).unwrap()
      setContract(result)
    } catch (error) {
      console.error('Fetch contract error:', error)
    } finally {
      setLoading(false)
    }
  }

  const contractStatus = statuses.find((s) => s.value === contract?.status)
  const paymentStatus = paymentStatuses.find(
    (s) => s.value === contract?.paymentStatus,
  )

  // Aggregate payment vouchers from invoices if not present on contract
  const paymentVouchers = contract?.paymentVouchers ||
    contract?.invoices?.flatMap(inv => inv.paymentVouchers || []) ||
    []

  const remainingAmount = contract
    ? parseFloat(contract.totalAmount) - parseFloat(contract.paidAmount || 0)
    : 0

  return (
    <>
      {selectedInvoiceId && (
        <ViewInvoiceDialog
          invoiceId={selectedInvoiceId}
          open={!!selectedInvoiceId}
          onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
          showTrigger={false}
          contentClassName="z-[100020] md:z-[100020]"
          overlayClassName="z-[100019] md:z-[100019]"
          onEdit={() => {
            const invoiceId = selectedInvoiceId
            setSelectedInvoiceId(null)
            setTimeout(() => {
              setSelectedInvoiceIdForUpdate(invoiceId)
              setShowUpdateInvoiceDialog(true)
            }, 100)
          }}
        />
      )}

      {showUpdateInvoiceDialog && selectedInvoiceIdForUpdate && (
        <InvoiceDialog
          open={showUpdateInvoiceDialog}
          onOpenChange={setShowUpdateInvoiceDialog}
          invoiceId={selectedInvoiceIdForUpdate}
          showTrigger={false}
          contentClassName="z-[100020] md:z-[100020]"
          overlayClassName="z-[100019] md:z-[100019]"
        />
      )}
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger ? (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            </Button>
          </DialogTrigger>
        ) : null}

        <DialogContent
          className={cn(
            'md:h-auto md:max-w-full',
            !isDesktop && 'fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none translate-x-0 translate-y-0 flex flex-col',
            contentClassName
          )}
          overlayClassName={overlayClassName}
        >
          <DialogHeader className={cn(!isDesktop && 'px-4 pt-4')}>
            <DialogTitle className={cn(!isDesktop && 'text-base flex flex-col gap-1')}>
              <span>Chi tiết hợp đồng bán hàng:</span>
              <span>{contract?.code}</span>
            </DialogTitle>
          </DialogHeader>

          <div
            className={cn(
              'overflow-auto',
              isDesktop ? 'max-h-[75vh]' : 'h-full px-4 pb-4 flex-1',
            )}
          >
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-[20px] w-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    'flex gap-6',
                    isDesktop ? 'flex-row' : 'flex-col',
                  )}
                >
                  <div
                    className={cn(
                      'flex-1 rounded-lg border',
                      isDesktop ? 'space-y-6 p-4' : 'space-y-4 p-3',
                    )}
                  >
                    <h2
                      className={cn(
                        'font-semibold',
                        isDesktop ? 'text-lg' : 'text-base',
                      )}
                    >
                      Thông tin hợp đồng
                    </h2>

                    {/* Contract Header Info */}
                    <div
                      className={cn(
                        'space-y-4 p-3 rounded-lg border bg-card',
                        isDesktop ? 'text-sm' : 'text-xs',
                      )}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">Mã hợp đồng:</span>
                          <p className="font-medium text-primary">{contract?.code}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ngày hợp đồng:</span>
                          <p className="font-medium">
                            {dateFormat(contract?.contractDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ngày giao hàng:</span>
                          <p className="font-medium text-orange-600">
                            {dateFormat(contract?.deliveryDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trạng thái:</span>
                          {contractStatus && (
                            <div className={`font-medium flex items-center ${contractStatus.color}`}>
                              {React.createElement(contractStatus.icon, {
                                className: 'mr-1 h-4 w-4',
                              })}
                              {contractStatus.label}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Điều khoản TT:</span>
                          <p className="font-medium">
                            {contract?.paymentTerm === 'cash' ? 'Tiền mặt' : contract?.paymentTerm}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Người tạo:</span>
                          <p className="font-medium">
                            {contract?.createdByUser?.fullName || 'N/A'}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Ghi chú:</span>
                          <p className="font-medium text-sm">
                            {contract?.note || 'Không có ghi chú'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={cn('space-y-6', !isDesktop && 'space-y-4')}>
                      {/* Product Items Table */}
                      {isDesktop ? (
                        <div className="overflow-x-auto rounded-lg border">
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead className="w-8">TT</TableHead>
                                <TableHead className="min-w-64">
                                  Sản phẩm
                                </TableHead>
                                <TableHead className="min-w-20">
                                  ĐVT
                                </TableHead>
                                <TableHead className="min-w-20 text-right">
                                  SL
                                </TableHead>
                                <TableHead className="min-w-28 text-right">
                                  Đơn giá
                                </TableHead>
                                <TableHead className="min-w-28 text-right">
                                  Thành tiền
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {contract?.items?.map((item, index) => (
                                <TableRow key={item.id || index}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="size-10 shrink-0 overflow-hidden rounded-md border cursor-pointer"
                                        onClick={() => {
                                          if (item?.productId) {
                                            setSelectedProductId(item.productId)
                                            setShowViewProductDialog(true)
                                          }
                                        }}
                                      >
                                        {item?.product?.image ? (
                                          <img
                                            src={getPublicUrl(item.product.image)}
                                            alt={item.productName}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <span
                                          className="font-medium text-sm text-blue-600 cursor-pointer hover:underline truncate"
                                          onClick={() => {
                                            if (item?.productId) {
                                              setSelectedProductId(item.productId)
                                              setShowViewProductDialog(true)
                                            }
                                          }}
                                        >
                                          {item.productName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {item.productCode}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {item.unitName}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {parseInt(item.quantity)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {moneyFormat(item.unitPrice)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {moneyFormat(item.totalAmount)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {contract?.items?.map((item, index) => (
                            <div key={item.id || index} className="flex gap-3 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors">
                              {/* Left: Image (clickable) */}
                              <div
                                className="shrink-0 cursor-pointer"
                                onClick={() => {
                                  if (item?.productId) {
                                    setSelectedProductId(item.productId)
                                    setShowViewProductDialog(true)
                                  }
                                }}
                              >
                                {item.product.image ? (
                                  <div className="size-16 rounded-md border overflow-hidden">
                                    <img src={getPublicUrl(item.product.image)} alt={item.productName} className="h-full w-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="size-16 rounded-md border bg-secondary flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>

                              {/* Middle: Info */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <div
                                  className="font-medium text-sm text-blue-600 truncate cursor-pointer hover:underline"
                                  onClick={() => {
                                    if (item?.productId) {
                                      setSelectedProductId(item.productId)
                                      setShowViewProductDialog(true)
                                    }
                                  }}
                                >
                                  {index + 1}. {item.productName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {item.productCode || '---'}
                                </div>

                                {/* Quantity x Price */}
                                <div className="text-xs">
                                  <span className="font-medium">{parseInt(item.quantity)}</span> {item.unitName || ''} x {moneyFormat(item.unitPrice)}
                                </div>
                              </div>

                              {/* Right: Total */}
                              <div className="shrink-0 text-right space-y-1">
                                <div className="text-sm font-bold text-primary">
                                  {moneyFormat(item.totalAmount)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Totals Section */}
                      <div
                        className={cn(
                          'space-y-4 p-4 rounded-lg border bg-card',
                          isDesktop ? 'text-sm' : 'text-xs',
                        )}
                      >
                        <div className="flex justify-between">
                          <strong>Tổng giá trị:</strong>
                          <span className="font-bold text-primary">
                            {moneyFormat(contract?.totalAmount)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <strong>Đã thanh toán:</strong>
                          <span className="font-medium text-green-600">
                            {moneyFormat(contract?.paidAmount || 0)}
                          </span>
                        </div>

                        <div className="flex justify-between border-t pt-2">
                          <strong>Còn lại:</strong>
                          <span
                            className={cn(
                              'font-bold',
                              remainingAmount > 0
                                ? 'text-red-600'
                                : 'text-green-600',
                            )}
                          >
                            {moneyFormat(remainingAmount)}
                          </span>
                        </div>

                        {/* Amount in words */}
                        <div className="flex flex-col border-t pt-2">
                          <strong className="text-muted-foreground mb-1">
                            Số tiền viết bằng chữ:
                          </strong>
                          <span className="font-bold text-primary">
                            {toVietnamese(contract?.totalAmount)}
                          </span>
                        </div>

                        {/* Payment Status */}
                        <div className="flex justify-between border-t pt-2">
                          <strong>Trạng thái thanh toán:</strong>
                          {paymentStatus && (
                            <span
                              className={`font-medium flex items-center ${paymentStatus.color}`}
                            >
                              {React.createElement(paymentStatus.icon, {
                                className: 'mr-1 h-4 w-4',
                              })}
                              {paymentStatus.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Invoices Section */}
                      {contract?.invoices && contract.invoices.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-3">
                            <h3 className={cn(
                              'font-semibold',
                              isDesktop ? 'text-base' : 'text-sm',
                            )}>
                              Đơn bán
                            </h3>

                            {isDesktop ? (
                              <div className="overflow-x-auto rounded-lg border">
                                <Table className="min-w-full">
                                  <TableHeader>
                                    <TableRow className="bg-secondary text-xs">
                                      <TableHead className="min-w-32">Mã hóa đơn</TableHead>
                                      <TableHead className="min-w-28 text-right">
                                        Tổng cộng
                                      </TableHead>
                                      <TableHead className="min-w-28 text-right">
                                        Đã thanh toán
                                      </TableHead>
                                      <TableHead className="min-w-28">
                                        Trạng thái
                                      </TableHead>
                                      <TableHead className="min-w-28">
                                        Thanh toán
                                      </TableHead>
                                      <TableHead className="min-w-32">
                                        Ngày tạo
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {contract.invoices.map((invoice, index) => {
                                      const invoiceStatus = invoiceStatuses.find(
                                        (s) => s.value === invoice.status,
                                      )
                                      const invoicePaymentStatus = paymentStatuses.find(
                                        (s) => s.value === invoice.paymentStatus,
                                      )
                                      return (
                                        <TableRow key={invoice.id || index}>
                                          <TableCell
                                            className="font-medium text-primary cursor-pointer hover:underline"
                                            onClick={() => setSelectedInvoiceId(invoice.id)}
                                          >
                                            {invoice.code}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {moneyFormat(invoice.totalAmount)}
                                          </TableCell>
                                          <TableCell className="text-right font-medium text-green-600">
                                            {moneyFormat(invoice.paidAmount || 0)}
                                          </TableCell>
                                          <TableCell>
                                            <div
                                              className="cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                // Check if status update is allowed
                                                if (['delivered', 'rejected'].includes(invoice.status) || invoice.paymentStatus === 'paid') {
                                                  return
                                                }
                                                setInvoiceToUpdateStatus(invoice)
                                                setShowUpdateInvoiceStatusDialog(true)
                                              }}
                                            >
                                              {(() => {
                                                const sObj = invoiceStatuses.find(s => s.value === invoice.status)
                                                // Determine if editable
                                                const isEditable = !(['delivered', 'rejected'].includes(invoice.status) || invoice.paymentStatus === 'paid')

                                                return sObj ? (
                                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${sObj.color} ${isEditable ? 'hover:opacity-80' : ''}`}>
                                                    {sObj.icon && React.createElement(sObj.icon, { className: "h-3 w-3" })}
                                                    {sObj.label}
                                                    {isEditable && <IconPencil className="h-3 w-3 ml-0.5" />}
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                    {invoice.status}
                                                  </span>
                                                )
                                              })()}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            {invoicePaymentStatus && (
                                              <div
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${invoicePaymentStatus.color}`}
                                              >
                                                {React.createElement(
                                                  invoicePaymentStatus.icon,
                                                  {
                                                    className: 'h-3 w-3',
                                                  },
                                                )}
                                                {invoicePaymentStatus.label}
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell className="text-sm">
                                            {dateFormat(invoice.createdAt, true)}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {contract.invoices.map((invoice, index) => {
                                  const invoiceStatus = statuses.find(
                                    (s) => s.value === invoice.status,
                                  )
                                  const invoicePaymentStatus = paymentStatuses.find(
                                    (s) => s.value === invoice.paymentStatus,
                                  )
                                  return (
                                    <div
                                      key={invoice.id || index}
                                      className="border rounded-lg p-3 space-y-2 bg-card text-xs"
                                    >
                                      <div
                                        className="font-medium text-primary cursor-pointer hover:underline"
                                        onClick={() => setSelectedInvoiceId(invoice.id)}
                                      >
                                        {invoice.code}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-muted-foreground">
                                            Tổng cộng:{' '}
                                          </span>
                                          <span className="font-medium">
                                            {moneyFormat(invoice.totalAmount)}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">
                                            Đã Thanh Toán:{' '}
                                          </span>
                                          <span className="font-medium text-green-600">
                                            {moneyFormat(invoice.paidAmount || 0)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                        {invoiceStatus && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">
                                              Trạng thái:
                                            </span>
                                            <div onClick={(e) => e.stopPropagation()}>
                                              <Select
                                                value={invoice.status}
                                                onValueChange={(val) => handleUpdateStatus(val, invoice.id)}
                                                disabled={['delivered', 'rejected'].includes(invoice.status) || invoice.paymentStatus === 'paid'}
                                              >
                                                <SelectTrigger
                                                  className={`h-6 w-auto p-0 border-none bg-transparent shadow-none focus:ring-0 ${invoiceStatus?.color?.replace('bg-', 'text-').replace('text-', 'bg-opacity-10 bg-') || ''
                                                    }`}
                                                >
                                                  <div className={`flex items-center gap-1 ${invoiceStatus?.color}`}>
                                                    {invoiceStatus?.icon && React.createElement(invoiceStatus.icon, {
                                                      className: "h-3 w-3"
                                                    })}
                                                    <span className="truncate text-xs font-medium">
                                                      {invoiceStatus?.label || invoice.status}
                                                    </span>
                                                  </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {getFilteredStatuses(invoice).map((status) => (
                                                    <SelectItem
                                                      key={status.value}
                                                      value={status.value}
                                                      className="text-xs"
                                                    >
                                                      <div className={`flex items-center gap-2 ${status.color}`}>
                                                        {status.icon && React.createElement(status.icon, { className: "h-3 w-3" })}
                                                        <span>{status.label}</span>
                                                      </div>
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                        )}
                                        {invoicePaymentStatus && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">
                                              Thanh Toán:
                                            </span>
                                            <div
                                              className={`inline-flex items-center gap-0.5 ${invoicePaymentStatus.color}`}
                                            >
                                              {React.createElement(
                                                invoicePaymentStatus.icon,
                                                {
                                                  className: 'h-3 w-3',
                                                },
                                              )}
                                              <span className="text-xs">
                                                {invoicePaymentStatus.label}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="border-t pt-2 text-muted-foreground">
                                        Ngày tạo:{' '}
                                        <span className="font-medium text-foreground">
                                          {dateFormat(invoice.createdAt, true)}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Payment Vouchers Section */}
                      {(paymentVouchers?.length > 0 || contract?.invoices?.length > 0) && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className={cn(
                                'font-semibold',
                                isDesktop ? 'text-base' : 'text-sm',
                              )}>
                                Phiếu thu
                              </h3>
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-green-600 text-white hover:bg-green-700 border-transparent"
                                onClick={handleCreateReceipt}
                              >
                                <PlusIcon className="h-4 w-4" />
                                <span>
                                  Thêm
                                </span>
                              </Button>
                            </div>

                            {isDesktop ? (
                              paymentVouchers?.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border">
                                  <Table className="min-w-full">
                                    <TableHeader>
                                      <TableRow className="bg-secondary text-xs">
                                        <TableHead className="w-12">STT</TableHead>
                                        <TableHead className="min-w-32">Mã phiếu</TableHead>
                                        <TableHead className="min-w-28 text-right">Số tiền</TableHead>
                                        <TableHead className="min-w-24">PT thanh toán</TableHead>
                                        <TableHead className="min-w-20">Trạng thái</TableHead>
                                        <TableHead className="min-w-20">Loại GD</TableHead>
                                        <TableHead className="min-w-32">Người tạo</TableHead>
                                        <TableHead className="min-w-32">Ngày tạo</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {paymentVouchers.map((voucher, index) => (
                                        <TableRow key={voucher.id}>
                                          <TableCell>{index + 1}</TableCell>
                                          <TableCell>
                                            <span
                                              className="cursor-pointer font-medium text-primary hover:underline hover:text-blue-600"
                                              onClick={() => handleOpenReceiptDetail(voucher)}
                                            >
                                              {voucher.code}
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-right font-semibold">
                                            {moneyFormat(voucher.amount)}
                                          </TableCell>
                                          <TableCell>
                                            {voucher.paymentMethod === 'cash'
                                              ? 'Tiền mặt'
                                              : voucher.paymentMethod === 'transfer'
                                                ? 'Chuyển khoản'
                                                : voucher.paymentMethod}
                                          </TableCell>
                                          <TableCell>
                                            <div
                                              className="cursor-pointer"
                                              onClick={() => {
                                                // if (['completed', 'cancelled', 'canceled'].includes(voucher.status)) return
                                                setSelectedReceipt(voucher)
                                                setShowUpdateReceiptStatus(true)
                                              }}
                                            >
                                              <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getReceiptStatusColor(voucher.status)}`}
                                              >
                                                {getReceiptStatusObj(voucher.status)?.icon &&
                                                  React.createElement(getReceiptStatusObj(voucher.status).icon, { className: "h-3 w-3" })
                                                }
                                                {getReceiptStatusObj(voucher.status)?.label || voucher.status}
                                              </span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            {voucher.transactionType === 'payment'
                                              ? 'Thanh toán'
                                              : voucher.transactionType === 'deposit'
                                                ? 'Đặt cọc'
                                                : voucher.transactionType === 'refund'
                                                  ? 'Hoàn tiền'
                                                  : voucher.transactionType}
                                          </TableCell>
                                          <TableCell>
                                            {voucher.createdByUser?.fullName || '—'}
                                          </TableCell>
                                          <TableCell>{dateFormat(voucher.createdAt, true)}</TableCell>
                                          <TableCell>
                                            {voucher.status === 'draft' && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-primary hover:text-primary/90 hover:bg-primary/10"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleGenerateQR(voucher)
                                                }}
                                                title="Tạo mã QR"
                                              >
                                                <QrCode className="h-4 w-4" />
                                              </Button>
                                            )}
                                            {(voucher.status === 'draft' || voucher.status === 'cancelled' || voucher.status === 'canceled') && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setReceiptToDelete(voucher)
                                                  setShowDeleteReceiptDialog(true)
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg bg-muted/20">
                                  Chưa có phiếu thu nào
                                </div>
                              )
                            ) : (
                              paymentVouchers?.length > 0 ? (
                                <div className="space-y-3">
                                  {paymentVouchers.map((voucher) => (
                                    <div key={voucher.id} className="space-y-2 rounded-lg border p-3 text-sm">
                                      <div className="flex justify-between items-center">
                                        <strong>Mã phiếu:</strong>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                                            onClick={() => handleOpenReceiptDetail(voucher)}
                                          >
                                            {voucher.code}
                                          </span>
                                          {voucher.status === 'draft' && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-primary hover:text-primary/90 hover:bg-primary/10 -mr-2"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleGenerateQR(voucher)
                                              }}
                                              title="Tạo mã QR"
                                            >
                                              <QrCode className="h-4 w-4" />
                                            </Button>
                                          )}
                                          {(voucher.status === 'draft' || voucher.status === 'cancelled' || voucher.status === 'canceled') && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10 -mr-2"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setReceiptToDelete(voucher)
                                                setShowDeleteReceiptDialog(true)
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex justify-between">
                                        <strong>Số tiền:</strong>
                                        <span className="font-semibold">{moneyFormat(voucher.amount)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <strong>PT thanh toán:</strong>
                                        <span>
                                          {voucher.paymentMethod === 'cash'
                                            ? 'Tiền mặt'
                                            : voucher.paymentMethod === 'transfer'
                                              ? 'Chuyển khoản'
                                              : voucher.paymentMethod}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <strong>Trạng thái:</strong>
                                        <div className='flex items-center justify-end'>
                                          <Select
                                            value={voucher.status}
                                            onValueChange={(val) => handleUpdateReceiptStatus(val, voucher.id)}
                                          >
                                            <SelectTrigger className="h-auto border-none bg-transparent p-0 text-xs focus:ring-0 focus:ring-offset-0">
                                              <SelectValue>
                                                <span
                                                  className={`inline-flex items-center gap-1 text-xs font-medium ${getReceiptStatusColor(voucher.status).replace(/bg-[^ ]+/, '').trim()}`}
                                                >
                                                  {getReceiptStatusObj(voucher.status)?.icon &&
                                                    React.createElement(getReceiptStatusObj(voucher.status).icon, { className: "h-3 w-3" })
                                                  }
                                                  {getReceiptStatusObj(voucher.status)?.label || voucher.status}
                                                </span>
                                              </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent align="end" className="w-[140px]">
                                              {receiptStatus
                                                .filter((s) => {
                                                  const currentStatus = voucher.status
                                                  if (
                                                    currentStatus === 'canceled' ||
                                                    currentStatus === 'cancelled'
                                                  ) {
                                                    return (
                                                      s.value === 'canceled' ||
                                                      s.value === 'cancelled'
                                                    )
                                                  }
                                                  if (currentStatus === 'completed') {
                                                    return s.value !== 'draft'
                                                  }
                                                  return true
                                                })
                                                .map((s) => (
                                                  <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                    className="text-xs"
                                                  >
                                                    <div
                                                      className={`flex items-center gap-1 rounded-full px-2 py-1 ${getReceiptStatusColor(s.value)}`}
                                                    >
                                                      {s.icon &&
                                                        React.createElement(
                                                          s.icon,
                                                          { className: 'h-3 w-3' },
                                                        )}
                                                      <span>{s.label}</span>
                                                    </div>
                                                  </SelectItem>
                                                ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="flex justify-between">
                                        <strong>Loại GD:</strong>
                                        <span>
                                          {voucher.transactionType === 'payment'
                                            ? 'Thanh toán'
                                            : voucher.transactionType === 'deposit'
                                              ? 'Đặt cọc'
                                              : voucher.transactionType === 'refund'
                                                ? 'Hoàn tiền'
                                                : voucher.transactionType}
                                        </span>
                                      </div>
                                      <div className="flex justify-between border-t pt-2">
                                        <strong>Người tạo:</strong>
                                        <span>{voucher.createdByUser?.fullName || '—'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <strong>Ngày tạo:</strong>
                                        <span>{dateFormat(voucher.createdAt, true)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg bg-muted/20">
                                  Chưa có phiếu thu nào
                                </div>
                              )
                            )}
                          </div>
                        </>
                      )}

                      {/* Warehouse Receipts Section */}
                      {(contract?.warehouseReceipts?.length > 0 || contract?.invoices?.length > 0) && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className={cn(
                                'font-semibold',
                                isDesktop ? 'text-base' : 'text-sm',
                              )}>
                                Phiếu xuất kho
                              </h3>
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-green-600 text-white hover:bg-green-700 border-transparent"
                                onClick={handleCreateWarehouseReceipt}
                              >
                                <PlusIcon className="h-4 w-4" />
                                <span>
                                  Thêm
                                </span>
                              </Button>
                            </div>

                            {isDesktop ? (
                              contract.warehouseReceipts?.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border">
                                  <Table className="min-w-full">
                                    <TableHeader>
                                      <TableRow className="bg-secondary text-xs">
                                        <TableHead className="min-w-32">Mã phiếu</TableHead>
                                        <TableHead className="min-w-28 text-right">
                                          Tổng tiền
                                        </TableHead>
                                        <TableHead className="min-w-28">
                                          Trạng thái
                                        </TableHead>
                                        <TableHead className="min-w-32">
                                          Ngày tạo
                                        </TableHead>
                                        <TableHead className="w-10"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {contract.warehouseReceipts.map((receipt, index) => {
                                        // Map status (assuming standard status strings)
                                        let statusColor = 'text-gray-500 bg-gray-100'
                                        let statusLabel = receipt.status
                                        if (receipt.status === 'draft') {
                                          statusColor = 'text-yellow-700 bg-yellow-100'
                                          statusLabel = 'Nháp'
                                        } else if (receipt.status === 'posted') {
                                          statusColor = 'text-green-700 bg-green-100'
                                          statusLabel = 'Đã ghi sổ'
                                        }

                                        return (
                                          <TableRow key={receipt.id || index}>
                                            <TableCell>
                                              <span
                                                className="font-medium text-blue-600 cursor-pointer hover:underline"
                                                onClick={() => {
                                                  setSelectedWarehouseReceiptId(receipt.id)
                                                  setShowViewWarehouseReceiptDialog(true)
                                                }}
                                              >
                                                {receipt.code}
                                              </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {moneyFormat(receipt.totalAmount)}
                                            </TableCell>
                                            <TableCell>
                                              <div
                                                className="cursor-pointer"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setSelectedWarehouseReceipt(receipt)
                                                  setShowUpdateWarehouseReceiptStatus(true)
                                                }}
                                              >
                                                <span
                                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getWarehouseReceiptStatusColor(receipt.status)}`}
                                                >
                                                  {receipt.status === 'draft' ? <IconPencil className="h-3 w-3" /> : (receipt.status === 'posted' ? <IconCheck className="h-3 w-3" /> : null)}
                                                  {receipt.status === 'draft'
                                                    ? 'Nháp'
                                                    : receipt.status === 'posted'
                                                      ? 'Đã ghi sổ'
                                                      : receipt.status === 'cancelled' ? 'Đã hủy' : receipt.status}
                                                </span>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                              {dateFormat(receipt.createdAt, true)}
                                            </TableCell>
                                            <TableCell>
                                              {['draft', 'cancelled'].includes(receipt.status) && (
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setWarehouseReceiptToDelete(receipt)
                                                    setShowDeleteWarehouseReceiptDialog(true)
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg bg-muted/20">
                                  Chưa có phiếu xuất kho nào
                                </div>
                              )
                            ) : (
                              contract.warehouseReceipts?.length > 0 ? (
                                <div className="space-y-2">
                                  {contract.warehouseReceipts.map((receipt, index) => {
                                    let statusColor = 'text-gray-500'
                                    let statusLabel = receipt.status
                                    if (receipt.status === 'draft') {
                                      statusColor = 'text-yellow-600'
                                      statusLabel = 'Nháp'
                                    } else if (receipt.status === 'posted') {
                                      statusColor = 'text-green-600'
                                      statusLabel = 'Đã ghi sổ'
                                    }

                                    return (
                                      <div
                                        key={receipt.id || index}
                                        className="border rounded-lg p-3 space-y-2 bg-card text-xs"
                                      >
                                        <div
                                          className="font-medium text-primary cursor-pointer hover:underline text-blue-600"
                                          onClick={() => {
                                            setSelectedWarehouseReceiptId(receipt.id)
                                            setShowViewWarehouseReceiptDialog(true)
                                          }}
                                        >
                                          {receipt.code}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <span className="text-muted-foreground">
                                              Tổng tiền:{' '}
                                            </span>
                                            <span className="font-medium">
                                              {moneyFormat(receipt.totalAmount)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">
                                              Trạng thái:{' '}
                                            </span>
                                            <div className='flex items-center justify-end'>
                                              <Select
                                                value={receipt.status}
                                                onValueChange={(val) => handleUpdateWarehouseReceiptStatus(val, receipt.id)}
                                              >
                                                <SelectTrigger className="h-auto border-none bg-transparent p-0 text-xs focus:ring-0 focus:ring-offset-0">
                                                  <SelectValue>
                                                    <span
                                                      className={`inline-flex items-center gap-1 text-xs font-medium ${getWarehouseReceiptStatusColor(receipt.status).replace('bg-', 'text-')}`}
                                                    >
                                                      {receipt.status === 'draft' ? <IconFileText className="h-3 w-3" /> : (receipt.status === 'posted' ? <IconCircleCheck className="h-3 w-3" /> : (receipt.status === 'cancelled' || receipt.status === 'canceled' ? <IconCircleX className="h-3 w-3" /> : null))}
                                                      {receipt.status === 'draft'
                                                        ? 'Nháp'
                                                        : receipt.status === 'posted'
                                                          ? 'Đã ghi sổ'
                                                          : (receipt.status === 'cancelled' || receipt.status === 'canceled')
                                                            ? 'Đã hủy'
                                                            : receipt.status}
                                                    </span>
                                                  </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent align="end" className="w-[140px]">
                                                  {warehouseReceiptStatuses
                                                    .map((s) => (
                                                      <SelectItem
                                                        key={s.value}
                                                        value={s.value}
                                                        className="text-xs"
                                                      >
                                                        <div
                                                          className={cn("flex items-center gap-1 rounded-full px-2 py-1 font-medium", getWarehouseReceiptStatusColor(s.value))}
                                                        >
                                                          {s.icon && <s.icon className="h-3 w-3" />}
                                                          <span>{s.label}</span>
                                                        </div>
                                                      </SelectItem>
                                                    ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="border-t pt-2 text-muted-foreground">
                                          Ngày tạo:{' '}
                                          <span className="font-medium text-foreground">
                                            {dateFormat(receipt.createdAt, true)}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg bg-muted/20">
                                  Chưa có phiếu xuất kho nào
                                </div>
                              )
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Customer Info Sidebar */}
                  <div
                    className={cn(
                      'rounded-lg border p-4',
                      isDesktop ? 'w-72 sticky top-0 self-start' : 'w-full',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h2
                        className={cn(
                          'py-2 font-semibold',
                          isDesktop ? 'text-lg' : 'text-base',
                        )}
                      >
                        Khách hàng
                      </h2>
                    </div>

                    <div className={cn(isDesktop ? 'space-y-6' : 'space-y-4')}>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?bold=true&background=random&name=${contract?.customer?.name}`}
                            alt={contract?.customer?.name}
                          />
                          <AvatarFallback>CU</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {contract?.customer?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {contract?.customer?.code}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-medium">Thông tin khách hàng</div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4">
                              <MobileIcon className="h-4 w-4" />
                            </div>
                            <a href={`tel:${contract?.customer?.phone}`}>
                              {contract?.customer?.phone || 'Chưa cập nhật'}
                            </a>
                          </div>

                          {contract?.customer?.identityCard && (
                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4">
                                <CreditCard className="h-4 w-4" />
                              </div>
                              <span>{contract.customer.identityCard}</span>
                            </div>
                          )}

                          {contract?.customer?.email && (
                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4">
                                <Mail className="h-4 w-4" />
                              </div>
                              <a href={`mailto:${contract?.customer?.email}`}>
                                {contract?.customer?.email}
                              </a>
                            </div>
                          )}

                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4">
                              <MapPin className="h-4 w-4" />
                            </div>
                            {contract?.customer?.address || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>

                      {/* Creator Info */}
                      <div className="flex items-center justify-between">
                        <h2 className="py-2 text-lg font-semibold">
                          Người lập hợp đồng
                        </h2>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?bold=true&background=random&name=${contract?.user?.fullName}`}
                              alt={contract?.createdByUser?.fullName}
                            />
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {contract?.createdByUser?.fullName} ({contract?.createdByUser?.code})
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="font-medium">Thông tin nhân viên</div>
                          </div>

                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <MobileIcon className="h-4 w-4" />
                              </div>
                              <a href={`tel:${contract?.createdByUser?.phone}`}>
                                {contract?.createdByUser?.phone || 'Chưa cập nhật'}
                              </a>
                            </div>

                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <Mail className="h-4 w-4" />
                              </div>
                              <a href={`mailto:${contract?.createdByUser?.email}`}>
                                {contract?.createdByUser?.email || 'Chưa cập nhật'}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className={cn(!isDesktop && "pb-4 px-4 flex flex-row gap-2")}>
            <Button
              size="sm"
              onClick={() => {
                if (contract?.status !== 'confirmed') {
                  toast.warning('Chỉ có thể thanh lý hợp đồng đã xác nhận')
                  return
                }
                setShowLiquidationDialog(true)
              }}
              className={cn("bg-orange-600 hover:bg-orange-700 text-white", !isDesktop && "flex-1")}
            >
              Thanh lý
            </Button>

            <Button size="sm" onClick={handlePrintContract} loading={installmentExporting} className={cn("bg-blue-600 hover:bg-blue-700 text-white", !isDesktop && "flex-1")}>
              <Printer className="mr-2 h-4 w-4" />
              In Hợp Đồng
            </Button>

            <Button
              size="sm"
              onClick={() => {
                if (contract?.status !== 'draft') {
                  toast.warning('Chỉ có thể xóa hợp đồng ở trạng thái nháp')
                  return
                }
                setShowDeleteDialog(true)
              }}
              className={cn("bg-red-600 hover:bg-red-700 text-white", !isDesktop && "flex-1")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>

            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" className={cn(!isDesktop && "flex-1")}>
                <X className="mr-2 h-4 w-4" />
                Đóng
              </Button>
            </DialogClose>
          </DialogFooter>

          {installmentData && (
            <InstallmentPreviewDialog
              open={showInstallmentPreview}
              onOpenChange={(open) => {
                if (!open) {
                  setShowInstallmentPreview(false)
                }
              }}
              initialData={installmentData}
              contentClassName="z-[100030]"
              overlayClassName="z-[100029]"
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

          {showLiquidationDialog && (
            <LiquidateContractDialog
              open={showLiquidationDialog}
              onOpenChange={setShowLiquidationDialog}
              contractId={contractId}
              contentClassName="z-[10006]"
              overlayClassName="z-[10005]"
              onSuccess={() => {
                fetchContractDetail()
              }}
            />
          )}

          {showDeleteDialog && contract?.status === 'draft' && (
            <DeleteSalesContractDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              contractId={contractId}
              onSuccess={() => {
                onOpenChange(false)
              }}
            />
          )}

          {/* View Product Dialog */}
          {selectedProductId && (
            <ViewProductDialog
              open={showViewProductDialog}
              onOpenChange={setShowViewProductDialog}
              productId={selectedProductId}
              showTrigger={false}
              contentClassName="z-[100020]"
              overlayClassName="z-[100019]"
            />
          )}

          {/* View Warehouse Receipt Dialog */}
          {selectedWarehouseReceiptId && (
            <ViewWarehouseReceiptDialog
              open={showViewWarehouseReceiptDialog}
              onOpenChange={setShowViewWarehouseReceiptDialog}
              receiptId={selectedWarehouseReceiptId}
              showTrigger={false}
              contentClassName="z-[100020] md:z-[100020]"
              overlayClassName="z-[100019] md:z-[100019]"
            />
          )}

          {/* Update Invoice Status Dialog */}
          {invoiceToUpdateStatus && (
            <UpdateInvoiceStatusDialog
              open={showUpdateInvoiceStatusDialog}
              onOpenChange={setShowUpdateInvoiceStatusDialog}
              invoiceId={invoiceToUpdateStatus.id}
              currentStatus={invoiceToUpdateStatus.status}
              statuses={invoiceStatuses}
              paymentStatus={invoiceToUpdateStatus.paymentStatus}
              onSuccess={() => {
                fetchContractDetail()
                // If the dialog doesn't close automatically on success, close it here
                setShowUpdateInvoiceStatusDialog(false)
              }}
              contentClassName="z-[100030]"
              className="z-[100030]"
              overlayClassName="z-[100029]"
              selectContentClassName="z-[100040]"
              title={`Cập nhật trạng thái hóa đơn: ${invoiceToUpdateStatus.code}`}
            />
          )}

          {/* Update Warehouse Receipt Status Dialog */}
          {selectedWarehouseReceipt && (
            <UpdateWarehouseReceiptStatusDialog
              open={showUpdateWarehouseReceiptStatus}
              onOpenChange={setShowUpdateWarehouseReceiptStatus}
              receiptId={selectedWarehouseReceipt.id}
              receiptCode={selectedWarehouseReceipt.code}
              currentStatus={selectedWarehouseReceipt.status}
              statuses={warehouseReceiptStatuses}
              onSubmit={handleUpdateWarehouseReceiptStatus}
              contentClassName="z-[100020]"
              overlayClassName="z-[100019]"
              selectContentClassName="z-[100050]"
            />
          )}

          <PaymentQRCodeDialog
            open={showQrDialog}
            onOpenChange={setShowQrDialog}
            qrCodeData={qrCodeData}
            className="z-[100060]"
            overlayClassName="z-[100059]"
          />

          {/* Delete Warehouse Receipt Dialog */}
          {warehouseReceiptToDelete && (
            <DeleteWarehouseReceiptDialog
              open={showDeleteWarehouseReceiptDialog}
              onOpenChange={setShowDeleteWarehouseReceiptDialog}
              receipt={warehouseReceiptToDelete}
              showTrigger={false}
              onSuccess={() => {
                setShowDeleteWarehouseReceiptDialog(false)
                fetchContractDetail()
              }}
              contentClassName="z-[100020]"
              overlayClassName="z-[100019]"
            />
          )}

          {/* Dialogs for Payment Vouchers */}
          {selectedReceiptId && (
            <ViewReceiptDialog
              open={showViewReceiptDialog}
              onOpenChange={setShowViewReceiptDialog}
              receiptId={selectedReceiptId}
              showTrigger={false}
              contentClassName="z-[100020]"
              overlayClassName="z-[100019]"
            />
          )}

          {selectedReceipt && (
            <UpdateReceiptStatusDialog
              open={showUpdateReceiptStatus}
              onOpenChange={setShowUpdateReceiptStatus}
              receiptId={selectedReceipt.id}
              currentStatus={selectedReceipt.status}
              statuses={receiptStatus} // Pass available statuses
              onSubmit={async (status, id) => {
                await handleUpdateReceiptStatus(status, id)
                setShowUpdateReceiptStatus(false)
              }}
              contentClassName="z-[100020]"
              overlayClassName="z-[100019]"
              selectContentClassName="z-[100060]"
              title={`Cập nhật trạng thái phiếu thu: ${selectedReceipt.code}`}
            />
          )}

          {receiptToDelete && (
            <DeleteReceiptDialog
              open={showDeleteReceiptDialog}
              onOpenChange={setShowDeleteReceiptDialog}
              receipt={receiptToDelete}
              showTrigger={false}
              onSuccess={() => {
                fetchContractDetail()
                setShowDeleteReceiptDialog(false)
              }}
              contentClassName="z-[100020]"
              overlayClassName="z-[100019]"
            />
          )}
          <CreateReceiptDialog
            open={showCreateReceiptDialog}
            onOpenChange={setShowCreateReceiptDialog}
            invoices={contract?.invoices?.[0]?.id ? [contract.invoices[0].id] : []}
            contentClassName="z-[100020]"
            overlayClassName="z-[100019]"
            showTrigger={false}
            onSuccess={() => {
              setShowCreateReceiptDialog(false)
              fetchContractDetail()
              toast.success('Tạo phiếu thu thành công')
            }}
          />

          <ConfirmWarehouseReceiptDialog
            open={showConfirmWarehouseDialog}
            onOpenChange={setShowConfirmWarehouseDialog}
            onConfirm={handleConfirmCreateWarehouseReceipt}
            invoice={warehouseDialogData}
            loading={warehouseLoading}
            type="contract"
            contentClassName="z-[100020]"
            overlayClassName="z-[100019]"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewSalesContractDialog
