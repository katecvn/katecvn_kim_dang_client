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
import { Mail, MapPin, CreditCard, Printer } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'
import ViewInvoiceDialog from '@/views/admin/invoice/components/ViewInvoiceDialog'
import { buildInstallmentData } from '../../invoice/helpers/BuildInstallmentData'
import InstallmentPreviewDialog from '../../invoice/components/InstallmentPreviewDialog'
import LiquidateContractDialog from './LiquidateContractDialog'
import { exportInstallmentWord } from '../../invoice/helpers/ExportInstallmentWord'
import { Package } from 'lucide-react'
import { getPublicUrl } from '@/utils/file'
import ViewProductDialog from '../../product/components/ViewProductDialog'

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

  // Liquidation State
  const [showLiquidationDialog, setShowLiquidationDialog] = useState(false)

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

  useEffect(() => {
    if (open && contractId) {
      fetchContractDetail()
    }
  }, [open, contractId])

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
            !isDesktop && 'h-screen max-h-screen w-screen max-w-none m-0 p-0 rounded-none',
            contentClassName
          )}
          overlayClassName={overlayClassName}
        >
          <DialogHeader className={cn(!isDesktop && 'px-4 pt-4')}>
            <DialogTitle className={cn(!isDesktop && 'text-base')}>
              Chi tiết hợp đồng bán hàng: {contract?.code}
            </DialogTitle>
            <DialogDescription className={cn(!isDesktop && 'text-xs')}>
              Dưới đây là thông tin chi tiết hợp đồng bán hàng: {contract?.code}
            </DialogDescription>
          </DialogHeader>

          <div
            className={cn(
              'overflow-auto',
              isDesktop ? 'max-h-[75vh]' : 'h-full px-4 pb-4',
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
                                {item.image ? (
                                  <div className="size-16 rounded-md border overflow-hidden">
                                    <img src={getPublicUrl(item.image)} alt={item.productName} className="h-full w-full object-cover" />
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
                                            {invoiceStatus && (
                                              <div
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${invoiceStatus.color}`}
                                              >
                                                {React.createElement(invoiceStatus.icon, {
                                                  className: 'h-3 w-3',
                                                })}
                                                {invoiceStatus.label}
                                              </div>
                                            )}
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
                                            Đã TT:{' '}
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
                                            <div
                                              className={`inline-flex items-center gap-0.5 ${invoiceStatus.color}`}
                                            >
                                              {React.createElement(invoiceStatus.icon, {
                                                className: 'h-3 w-3',
                                              })}
                                              <span className="text-xs">
                                                {invoiceStatus.label}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                        {invoicePaymentStatus && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">
                                              TT:
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

                      {/* Warehouse Receipts Section */}
                      {contract?.warehouseReceipts && contract.warehouseReceipts.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-3">
                            <h3 className={cn(
                              'font-semibold',
                              isDesktop ? 'text-base' : 'text-sm',
                            )}>
                              Phiếu xuất kho
                            </h3>

                            {isDesktop ? (
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
                                          <TableCell className="font-medium text-primary">
                                            {receipt.code}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {moneyFormat(receipt.totalAmount)}
                                          </TableCell>
                                          <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                              {statusLabel}
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-sm">
                                            {dateFormat(receipt.createdAt, true)}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
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
                                      <div className="font-medium text-primary">
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
                                          <span className={`font-medium ${statusColor}`}>
                                            {statusLabel}
                                          </span>
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

          <DialogFooter className="flex flex-row flex-wrap items-center justify-center sm:justify-end gap-2 !space-x-0">
            {contract?.status === 'confirmed' && (
              <Button size="sm" onClick={() => setShowLiquidationDialog(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                Thanh lý
              </Button>
            )}
            <Button size="sm" onClick={handlePrintContract} loading={installmentExporting} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="mr-2 h-4 w-4" />
              In Hợp Đồng
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
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
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewSalesContractDialog
