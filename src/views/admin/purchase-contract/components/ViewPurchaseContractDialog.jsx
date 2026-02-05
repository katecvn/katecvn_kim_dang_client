import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import LiquidatePurchaseContractDialog from './LiquidatePurchaseContractDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { getPurchaseContractDetail } from '@/stores/PurchaseContractSlice'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { Button } from '@/components/custom/Button'
import { purchaseOrderStatuses } from '../../purchase-order/data'
import { useDispatch } from 'react-redux'
import { Separator } from '@/components/ui/separator'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import { PlusIcon, MobileIcon } from '@radix-ui/react-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'
import { Package, Mail, MapPin, CreditCard, Trash2 } from 'lucide-react'
import { getPublicUrl } from '@/utils/file'
import { purchaseContractStatuses } from '../data'
import { toast } from 'sonner'
import ViewProductDialog from '../../product/components/ViewProductDialog'
import ViewPurchaseOrderDialog from '../../purchase-order/components/ViewPurchaseOrderDialog'
import UpdatePurchaseOrderStatusDialog from '../../purchase-order/components/UpdatePurchaseOrderStatusDialog'
import {
  updatePurchaseOrderStatus,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  revertPurchaseOrder
} from '@/stores/PurchaseOrderSlice'
import ViewWarehouseReceiptDialog from '../../warehouse-receipt/components/ViewWarehouseReceiptDialog'
import ViewPaymentDialog from '../../payment/components/ViewPaymentDialog'
import UpdatePaymentStatusDialog from '../../payment/components/UpdatePaymentStatusDialog'
import { updatePaymentStatus } from '@/stores/PaymentSlice'
import { paymentStatus } from '../../payment/data'
import { UpdateWarehouseReceiptStatusDialog } from '../../warehouse-receipt/components/UpdateWarehouseReceiptStatusDialog'
import { warehouseReceiptStatuses } from '../../warehouse-receipt/data'
import { DeletePaymentDialog } from '../../payment/components/DeletePaymentDialog'
import { DeleteWarehouseReceiptDialog } from '../../warehouse-receipt/components/DeleteWarehouseReceiptDialog'

const ViewPurchaseContractDialog = ({
  open,
  onOpenChange,
  purchaseContractId,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const dispatch = useDispatch()
  const [contract, setContract] = useState({})
  const [loading, setLoading] = useState(false)
  const [showLiquidationDialog, setShowLiquidationDialog] = useState(false)
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [showViewPurchaseOrderDialog, setShowViewPurchaseOrderDialog] = useState(false)
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null)

  const [showViewWarehouseReceiptDialog, setShowViewWarehouseReceiptDialog] = useState(false)
  const [selectedWarehouseReceiptId, setSelectedWarehouseReceiptId] = useState(null)

  const [showViewPaymentDialog, setShowViewPaymentDialog] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)

  const [showUpdatePurchaseOrderStatus, setShowUpdatePurchaseOrderStatus] = useState(false)
  const [selectedPurchaseOrderForUpdate, setSelectedPurchaseOrderForUpdate] = useState(null)

  // Update Payment Status States
  const [showUpdatePaymentStatus, setShowUpdatePaymentStatus] = useState(false)
  const [selectedPaymentForUpdate, setSelectedPaymentForUpdate] = useState(null)

  // Update Warehouse Receipt Status States
  const [showUpdateWarehouseReceiptStatus, setShowUpdateWarehouseReceiptStatus] = useState(false)
  const [selectedWarehouseReceiptForUpdate, setSelectedWarehouseReceiptForUpdate] = useState(null)

  // Delete Dialog States
  const [showDeletePaymentDialog, setShowDeletePaymentDialog] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState(null)
  const [showDeleteWarehouseReceiptDialog, setShowDeleteWarehouseReceiptDialog] = useState(false)
  const [warehouseReceiptToDelete, setWarehouseReceiptToDelete] = useState(null)

  useEffect(() => {
    if (open && purchaseContractId) {
      fetchContractDetail()
    }
  }, [open, purchaseContractId])

  const fetchContractDetail = async () => {
    setLoading(true)
    try {
      const result = await dispatch(getPurchaseContractDetail(purchaseContractId)).unwrap()
      setContract(result)
    } catch (error) {
      console.error('Fetch contract error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePurchaseOrderStatus = async (newStatus, poId) => {
    try {
      const orderToUpdate = contract.purchaseOrders?.find(o => o.id === poId)
      if (!orderToUpdate) return

      if (newStatus === 'ordered') {
        await dispatch(confirmPurchaseOrder(poId)).unwrap()
        toast.success('Đã xác nhận đơn hàng')
      } else if (newStatus === 'cancelled') {
        await dispatch(cancelPurchaseOrder(poId)).unwrap()
        toast.success('Đã hủy đơn hàng')
      } else if (newStatus === 'draft' && orderToUpdate.status === 'ordered') {
        await dispatch(revertPurchaseOrder(poId)).unwrap()
        toast.success('Đã chuyển về nháp')
      } else {
        await dispatch(updatePurchaseOrderStatus({ id: poId, status: newStatus })).unwrap()
        // toast.success('Cập nhật trạng thái thành công') // slice might already toast
      }

      fetchContractDetail()
      setShowUpdatePurchaseOrderStatus(false)
    } catch (error) {
      console.error('Update PO status error:', error)
    }
  }

  const handleUpdatePaymentStatus = async (status, id) => {
    try {
      await dispatch(updatePaymentStatus({ id, status })).unwrap()
      toast.success('Cập nhật trạng thái phiếu chi thành công')
      setShowUpdatePaymentStatus(false)
      fetchContractDetail()
    } catch (error) {
      console.error(error)
    }
  }

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
    }
  }

  const contractStatus = purchaseContractStatuses.find((s) => s.value === contract?.status)
  const remainingAmount = contract
    ? parseFloat(contract.totalAmount || 0) - parseFloat(contract.paidAmount || 0)
    : 0

  // Aggregate items from all purchase orders if direct items are missing
  const items = contract?.items || contract?.purchaseOrders?.flatMap(po => po.items) || []

  return (
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
            <span>Chi tiết hợp đồng mua hàng:</span>
            <span>{contract?.code}</span>
          </DialogTitle>
        </DialogHeader>

        <div className={cn('overflow-auto', isDesktop ? 'max-h-[75vh]' : 'h-full px-4 pb-4 flex-1')}>
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
              <div className={cn('flex gap-6', isDesktop ? 'flex-row' : 'flex-col')}>
                {/* MAIN CONTENT */}
                <div className={cn('flex-1 rounded-lg border', isDesktop ? 'space-y-6 p-4' : 'space-y-4 p-3')}>
                  <h2 className={cn('font-semibold', isDesktop ? 'text-lg' : 'text-base')}>
                    Thông tin hợp đồng
                  </h2>

                  {/* Contract Header Info */}
                  <div className={cn('space-y-3 p-3 rounded-lg border bg-card', isDesktop ? 'text-sm' : 'text-xs')}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground">Mã hợp đồng:</span>
                        <p className="font-medium text-primary">{contract?.code}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ngày hợp đồng:</span>
                        <p className="font-medium">{dateFormat(contract?.contractDate)}</p>
                      </div>

                      {contract?.validUntil && (
                        <div>
                          <span className="text-muted-foreground">Hiệu lực đến:</span>
                          <p className="font-medium text-orange-600">{dateFormat(contract.validUntil)}</p>
                        </div>
                      )}

                      {contract?.externalOrderCode && (
                        <div>
                          <span className="text-muted-foreground">Mã đơn NCC:</span>
                          <p className="font-medium">{contract.externalOrderCode}</p>
                        </div>
                      )}

                      {contract?.purchaseOrders?.[0]?.expectedDeliveryDate && (
                        <div>
                          <span className="text-muted-foreground">Ngày giao hàng:</span>
                          <p className="font-medium text-orange-600">
                            {dateFormat(contract?.purchaseOrders?.[0]?.expectedDeliveryDate)}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-muted-foreground">Trạng thái:</span>
                        {contractStatus && (
                          <div className={`font-medium flex items-center ${contractStatus.color}`}>
                            {React.createElement(contractStatus.icon, { className: 'mr-1 h-4 w-4' })}
                            {contractStatus.label}
                          </div>
                        )}
                      </div>

                      {contract?.paymentMethod && (
                        <div>
                          <span className="text-muted-foreground">PT thanh toán:</span>
                          <p className="font-medium">
                            {contract.paymentMethod === 'cash' ? 'Tiền mặt' :
                              contract.paymentMethod === 'transfer' ? 'Chuyển khoản' :
                                contract.paymentMethod}
                          </p>
                        </div>
                      )}
                    </div>

                    {contract?.terms && (
                      <div className="col-span-2 border-t pt-2">
                        <span className="text-muted-foreground">Điều khoản:</span>
                        <p className="text-xs mt-1 whitespace-pre-line">{contract.terms}</p>
                      </div>
                    )}

                    {contract?.paymentTerms && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Điều khoản thanh toán:</span>
                        <p className="text-xs mt-1">{contract.paymentTerms}</p>
                      </div>
                    )}

                    {contract?.note && (
                      <div className="col-span-2 border-t pt-2">
                        <span className="text-muted-foreground">Ghi chú:</span>
                        <p className="font-medium text-sm">{contract.note}</p>
                      </div>
                    )}
                  </div>

                  <div className={cn('space-y-6', !isDesktop && 'space-y-4')}>
                    {/* Product Items Table */}
                    {items && items.length > 0 ? (
                      isDesktop ? (
                        <div className="overflow-x-auto rounded-lg border">
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead className="w-8">STT</TableHead>
                                <TableHead className="min-w-64">Sản phẩm</TableHead>
                                <TableHead className="min-w-20">ĐVT</TableHead>
                                <TableHead className="min-w-20 text-right">SL</TableHead>
                                <TableHead className="min-w-28 text-right">Đơn giá</TableHead>
                                <TableHead className="min-w-28 text-right">Thành tiền</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item, index) => (
                                <TableRow key={item.id || index}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>
                                    <div
                                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => {
                                        if (item.productId) {
                                          setSelectedProductId(item.productId)
                                          setShowViewProductDialog(true)
                                        }
                                      }}
                                    >
                                      <div className="size-10 shrink-0 overflow-hidden rounded-md border">
                                        {item.product?.image || item.image ? (
                                          <img
                                            src={getPublicUrl(item.product?.image || item.image)}
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
                                        <span className="font-medium text-sm hover:underline text-blue-600">{item.productName}</span>
                                        <span className="text-xs text-muted-foreground">{item.productCode}</span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.unitName}</TableCell>
                                  <TableCell className="text-right">{parseInt(item.quantity)}</TableCell>
                                  <TableCell className="text-right">{moneyFormat(item.unitPrice)}</TableCell>
                                  <TableCell className="text-right font-medium">{moneyFormat(item.totalAmount)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {items.map((item, index) => (
                            <div key={item.id || index} className="flex gap-3 py-3 border-b last:border-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => {
                              if (item.productId) {
                                setSelectedProductId(item.productId)
                                setShowViewProductDialog(true)
                              }
                            }}>
                              <div className="shrink-0">
                                {item.product?.image || item.image ? (
                                  <div className="size-16 rounded-md border overflow-hidden">
                                    <img src={getPublicUrl(item.product?.image || item.image)} alt={item.productName} className="h-full w-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="size-16 rounded-md border bg-secondary flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="font-medium text-sm truncate text-blue-600 hover:underline">{index + 1}. {item.productName}</div>
                                <div className="text-xs text-muted-foreground truncate">{item.productCode || '---'}</div>
                                <div className="text-xs">
                                  <span className="font-medium">{parseInt(item.quantity)}</span> {item.unitName || ''} x {moneyFormat(item.unitPrice)}
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="text-sm font-bold text-primary">{moneyFormat(item.totalAmount)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center text-sm text-muted-foreground italic py-4">
                        Chưa có sản phẩm nào
                      </div>
                    )}

                    {/* Totals Section */}
                    <div className={cn('space-y-3 p-4 rounded-lg border bg-card', isDesktop ? 'text-sm' : 'text-xs')}>
                      {contract?.otherCosts > 0 && (
                        <div className="flex justify-between">
                          <strong>Chi phí khác:</strong>
                          <span>{moneyFormat(contract.otherCosts)}</span>
                        </div>
                      )}

                      {contract?.taxAmount > 0 && (
                        <div className="flex justify-between">
                          <strong>Thuế:</strong>
                          <span>{moneyFormat(contract.taxAmount)}</span>
                        </div>
                      )}

                      {contract?.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <strong>Giảm giá:</strong>
                          <span className="text-red-500">{moneyFormat(contract.discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between border-t pt-2">
                        <strong>Tổng giá trị:</strong>
                        <span className="font-bold text-primary text-lg">{moneyFormat(contract?.totalAmount)}</span>
                      </div>

                      {contract?.paidAmount > 0 && (
                        <div className="flex justify-between">
                          <strong>Đã thanh toán:</strong>
                          <span className="font-medium text-green-600">{moneyFormat(contract.paidAmount)}</span>
                        </div>
                      )}

                      {remainingAmount > 0 && (
                        <div className="flex justify-between">
                          <strong>Còn lại:</strong>
                          <span className="font-medium text-orange-600">{moneyFormat(remainingAmount)}</span>
                        </div>
                      )}

                      <div className="flex flex-col border-t pt-2">
                        <strong className="text-muted-foreground mb-1">Số tiền viết bằng chữ:</strong>
                        <span className="font-bold text-primary">{toVietnamese(contract?.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Purchase Orders Section */}
                    {contract?.purchaseOrders && contract.purchaseOrders.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <h3 className="font-semibold">Đơn đặt hàng liên quan</h3>
                          {isDesktop ? (
                            <div className="overflow-x-auto rounded-lg border">
                              <Table className="min-w-full">
                                <TableHeader>
                                  <TableRow className="bg-secondary text-xs">
                                    <TableHead className="w-12">STT</TableHead>
                                    <TableHead className="min-w-32">Mã đơn</TableHead>
                                    <TableHead className="min-w-28 text-right">Tổng tiền</TableHead>
                                    <TableHead className="min-w-28 text-right">Đã thanh toán</TableHead>
                                    <TableHead className="min-w-24">Trạng thái</TableHead>
                                    <TableHead className="min-w-32">Ngày đặt</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {contract.purchaseOrders.map((order, index) => {
                                    const orderStatus = purchaseOrderStatuses?.find(s => s.value === order.status)
                                    return (
                                      <TableRow key={order.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                          <span
                                            className="font-medium text-blue-600 cursor-pointer hover:underline"
                                            onClick={() => {
                                              setSelectedPurchaseOrderId(order.id)
                                              setShowViewPurchaseOrderDialog(true)
                                            }}
                                          >
                                            {order.code}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{moneyFormat(order.totalAmount)}</TableCell>
                                        <TableCell className="text-right text-green-600">{moneyFormat(order.paidAmount)}</TableCell>
                                        <TableCell>
                                          <span
                                            className={cn(
                                              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                                              orderStatus?.bgColor || 'bg-gray-100 text-gray-700',
                                              ['completed', 'cancelled'].includes(order.status) ? "cursor-default opacity-80" : "cursor-pointer hover:opacity-80"
                                            )}
                                            onClick={() => {
                                              if (!['completed', 'cancelled'].includes(order.status)) {
                                                setSelectedPurchaseOrderForUpdate(order)
                                                setShowUpdatePurchaseOrderStatus(true)
                                              }
                                            }}
                                            title={!['completed', 'cancelled'].includes(order.status) ? "Bấm để cập nhật trạng thái" : ""}
                                          >
                                            {orderStatus?.label || order.status}
                                          </span>
                                        </TableCell>
                                        <TableCell>{dateFormat(order.orderDate, true)}</TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {contract.purchaseOrders.map((order, index) => {
                                const orderStatus = purchaseOrderStatuses?.find((s) => s.value === order.status)
                                return (
                                  <div
                                    key={order.id || index}
                                    className="border rounded-lg p-3 space-y-2 bg-card text-xs"
                                  >
                                    <div
                                      className="font-medium text-primary cursor-pointer hover:underline text-blue-600"
                                      onClick={() => {
                                        setSelectedPurchaseOrderId(order.id)
                                        setShowViewPurchaseOrderDialog(true)
                                      }}
                                    >
                                      {order.code}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Tổng cộng:{' '}
                                        </span>
                                        <span className="font-medium">
                                          {moneyFormat(order.totalAmount)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Đã Thanh Toán:{' '}
                                        </span>
                                        <span className="font-medium text-green-600">
                                          {moneyFormat(order.paidAmount || 0)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                      {orderStatus && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-muted-foreground">
                                            Trạng thái:
                                          </span>
                                          <div
                                            className={cn(
                                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                                              orderStatus.bgColor,
                                              ['completed', 'cancelled'].includes(order.status) ? "cursor-default opacity-80" : "cursor-pointer hover:opacity-80"
                                            )}
                                            onClick={() => {
                                              if (!['completed', 'cancelled'].includes(order.status)) {
                                                setSelectedPurchaseOrderForUpdate(order)
                                                setShowUpdatePurchaseOrderStatus(true)
                                              }
                                            }}
                                            title={!['completed', 'cancelled'].includes(order.status) ? "Bấm để cập nhật trạng thái" : ""}
                                          >
                                            {orderStatus.icon && React.createElement(orderStatus.icon, { className: "h-3 w-3" })}
                                            <span className="truncate text-xs font-medium">
                                              {orderStatus.label}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="border-t pt-2 text-muted-foreground">
                                      Ngày đặt:{' '}
                                      <span className="font-medium text-foreground">
                                        {dateFormat(order.orderDate, true)}
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
                    {contract?.paymentVouchers && contract.paymentVouchers.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <h3 className="font-semibold">Phiếu chi</h3>
                          {isDesktop ? (
                            <div className="overflow-x-auto rounded-lg border">
                              <Table className="min-w-full">
                                <TableHeader>
                                  <TableRow className="bg-secondary text-xs">
                                    <TableHead className="w-12">STT</TableHead>
                                    <TableHead className="min-w-32">Mã phiếu</TableHead>
                                    <TableHead className="min-w-28 text-right">Số tiền</TableHead>
                                    <TableHead className="min-w-24">Trạng thái</TableHead>
                                    <TableHead className="min-w-32">Ngày chi</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {contract.paymentVouchers.map((voucher, index) => {
                                    let statusLabel = voucher.status;
                                    let statusColor = "bg-gray-100 text-gray-700";

                                    if (voucher.status === 'draft') {
                                      statusLabel = 'Nháp';
                                      statusColor = 'bg-yellow-100 text-yellow-700';
                                    } else if (voucher.status === 'completed') {
                                      statusLabel = 'Đã chi';
                                      statusColor = 'bg-green-100 text-green-700';
                                    } else if (voucher.status === 'cancelled') {
                                      statusLabel = 'Đã hủy';
                                      statusColor = 'bg-red-100 text-red-700';
                                    }

                                    return (
                                      <TableRow key={voucher.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                          <span
                                            className="font-medium text-blue-600 cursor-pointer hover:underline"
                                            onClick={() => {
                                              setSelectedPaymentId(voucher.id)
                                              setShowViewPaymentDialog(true)
                                            }}
                                          >
                                            {voucher.code}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{moneyFormat(voucher.amount)}</TableCell>
                                        <TableCell>
                                          <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColor} cursor-pointer hover:opacity-80`}
                                            onClick={() => {
                                              setSelectedPaymentForUpdate(voucher)
                                              setShowUpdatePaymentStatus(true)
                                            }}
                                            title="Bấm để cập nhật trạng thái"
                                          >
                                            {statusLabel}
                                          </span>
                                        </TableCell>
                                        <TableCell>{dateFormat(voucher.paymentDate, true)}</TableCell>
                                        <TableCell>
                                          {['draft', 'cancelled'].includes(voucher.status) && (
                                            <div
                                              className="flex items-center justify-center cursor-pointer text-red-500 hover:text-red-600 transition-colors"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setPaymentToDelete(voucher)
                                                setShowDeletePaymentDialog(true)
                                              }}
                                              title="Xóa phiếu chi"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </div>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {contract.paymentVouchers.map((voucher, index) => {
                                let statusLabel = voucher.status;
                                let statusColor = "bg-gray-100 text-gray-700";

                                if (voucher.status === 'draft') {
                                  statusLabel = 'Nháp';
                                  statusColor = 'bg-yellow-100 text-yellow-700';
                                } else if (voucher.status === 'completed') {
                                  statusLabel = 'Đã chi';
                                  statusColor = 'bg-green-100 text-green-700';
                                } else if (voucher.status === 'cancelled') {
                                  statusLabel = 'Đã hủy';
                                  statusColor = 'bg-red-100 text-red-700';
                                }

                                return (
                                  <div
                                    key={voucher.id || index}
                                    className="border rounded-lg p-3 space-y-2 bg-card text-xs relative"
                                  >
                                    <div className="font-medium text-primary cursor-pointer hover:underline text-blue-600"
                                      onClick={() => {
                                        setSelectedPaymentId(voucher.id)
                                        setShowViewPaymentDialog(true)
                                      }}
                                    >
                                      {voucher.code}
                                    </div>
                                    {['draft', 'cancelled'].includes(voucher.status) && (
                                      <div
                                        className="absolute top-3 right-3 text-red-500 hover:text-red-600 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setPaymentToDelete(voucher)
                                          setShowDeletePaymentDialog(true)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Số tiền:{' '}
                                        </span>
                                        <span className="font-medium">
                                          {moneyFormat(voucher.amount)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                      <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">
                                          Trạng thái:
                                        </span>
                                        <div
                                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${statusColor} cursor-pointer hover:opacity-80`}
                                          onClick={() => {
                                            setSelectedPaymentForUpdate(voucher)
                                            setShowUpdatePaymentStatus(true)
                                          }}
                                          title="Bấm để cập nhật trạng thái"
                                        >
                                          <span className="truncate text-xs font-medium">
                                            {statusLabel}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="border-t pt-2 text-muted-foreground">
                                      Ngày chi:{' '}
                                      <span className="font-medium text-foreground">
                                        {dateFormat(voucher.paymentDate, true)}
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
                          <h3 className="font-semibold">Phiếu nhập kho</h3>
                          {isDesktop ? (
                            <div className="overflow-x-auto rounded-lg border">
                              <Table className="min-w-full">
                                <TableHeader>
                                  <TableRow className="bg-secondary text-xs">
                                    <TableHead className="w-12">STT</TableHead>
                                    <TableHead className="min-w-32">Mã phiếu</TableHead>
                                    <TableHead className="min-w-28 text-right">Tổng tiền</TableHead>
                                    <TableHead className="min-w-24">Trạng thái</TableHead>
                                    <TableHead className="min-w-32">Ngày nhập</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {contract.warehouseReceipts.map((receipt, index) => {
                                    let statusLabel = receipt.status;
                                    let statusColor = "bg-gray-100 text-gray-700";

                                    if (receipt.status === 'draft') {
                                      statusLabel = 'Nháp';
                                      statusColor = 'bg-yellow-100 text-yellow-700';
                                    } else if (receipt.status === 'posted') {
                                      statusLabel = 'Đã ghi sổ';
                                      statusColor = 'bg-green-100 text-green-700';
                                    } else if (receipt.status === 'cancelled') {
                                      statusLabel = 'Đã hủy';
                                      statusColor = 'bg-red-100 text-red-700';
                                    }

                                    return (
                                      <TableRow key={receipt.id}>
                                        <TableCell>{index + 1}</TableCell>
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
                                        <TableCell className="text-right font-semibold">{moneyFormat(receipt.totalAmount)}</TableCell>
                                        <TableCell>
                                          <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColor} cursor-pointer hover:opacity-80`}
                                            onClick={() => {
                                              setSelectedWarehouseReceiptForUpdate(receipt)
                                              setShowUpdateWarehouseReceiptStatus(true)
                                            }}
                                            title="Bấm để cập nhật trạng thái"
                                          >
                                            {statusLabel}
                                          </span>
                                        </TableCell>
                                        <TableCell>{dateFormat(receipt.receiptDate, true)}</TableCell>
                                        <TableCell>
                                          {['draft', 'cancelled'].includes(receipt.status) && (
                                            <div
                                              className="flex items-center justify-center cursor-pointer text-red-500 hover:text-red-600 transition-colors"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setWarehouseReceiptToDelete(receipt)
                                                setShowDeleteWarehouseReceiptDialog(true)
                                              }}
                                              title="Xóa phiếu nhập"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </div>
                                          )}
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
                                let statusLabel = receipt.status;
                                let statusColor = "bg-gray-100 text-gray-700";

                                if (receipt.status === 'draft') {
                                  statusLabel = 'Nháp';
                                  statusColor = 'bg-yellow-100 text-yellow-700';
                                } else if (receipt.status === 'posted') {
                                  statusLabel = 'Đã ghi sổ';
                                  statusColor = 'bg-green-100 text-green-700';
                                } else if (receipt.status === 'cancelled') {
                                  statusLabel = 'Đã hủy';
                                  statusColor = 'bg-red-100 text-red-700';
                                }

                                return (
                                  <div
                                    key={receipt.id || index}
                                    className="border rounded-lg p-3 space-y-2 bg-card text-xs relative"
                                  >
                                    <div className="font-medium text-primary cursor-pointer hover:underline text-blue-600"
                                      onClick={() => {
                                        setSelectedWarehouseReceiptId(receipt.id)
                                        setShowViewWarehouseReceiptDialog(true)
                                      }}
                                    >
                                      {receipt.code}
                                    </div>
                                    {['draft', 'cancelled'].includes(receipt.status) && (
                                      <div
                                        className="absolute top-3 right-3 text-red-500 hover:text-red-600 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setWarehouseReceiptToDelete(receipt)
                                          setShowDeleteWarehouseReceiptDialog(true)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Tổng cộng:{' '}
                                        </span>
                                        <span className="font-medium">
                                          {moneyFormat(receipt.totalAmount)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                      <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">
                                          Trạng thái:
                                        </span>
                                        <div
                                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${statusColor} cursor-pointer hover:opacity-80`}
                                          onClick={() => {
                                            setSelectedWarehouseReceiptForUpdate(receipt)
                                            setShowUpdateWarehouseReceiptStatus(true)
                                          }}
                                          title="Bấm để cập nhật trạng thái"
                                        >
                                          <span className="truncate text-xs font-medium">
                                            {statusLabel}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="border-t pt-2 text-muted-foreground">
                                      Ngày nhập:{' '}
                                      <span className="font-medium text-foreground">
                                        {dateFormat(receipt.receiptDate, true)}
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

                {/* SIDEBAR */}
                <div className={cn('rounded-lg border p-4 bg-card', isDesktop ? 'w-72 sticky top-0 h-fit' : 'w-full')}>
                  {/* Supplier Info */}
                  <div className="flex items-center justify-between">
                    <h2 className={cn('py-2 font-semibold', isDesktop ? 'text-lg' : 'text-base')}>
                      Nhà cung cấp
                    </h2>
                  </div>

                  <div className={cn(isDesktop ? 'space-y-6' : 'space-y-4')}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${contract?.supplier?.name}`}
                          alt={contract?.supplier?.name}
                        />
                        <AvatarFallback>NCC</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{contract?.supplier?.name}</div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-medium">Thông tin liên hệ</div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                          <MobileIcon className="mr-2 h-4 w-4" />
                          <a href={`tel:${contract?.supplier?.phone}`}>
                            {contract?.supplier?.phone || 'Chưa cập nhật'}
                          </a>
                        </div>

                        {contract?.supplier?.email && (
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="mr-2 h-4 w-4" />
                            <a href={`mailto:${contract.supplier.email}`}>{contract.supplier.email}</a>
                          </div>
                        )}

                        <div className="flex items-center text-primary hover:text-secondary-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {contract?.supplier?.address || 'Chưa cập nhật'}
                        </div>

                        {contract?.supplier?.taxCode && (
                          <div className="flex items-center text-muted-foreground">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>MST: {contract.supplier.taxCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Creator Info */}
                  {contract?.createdByUser && (
                    <div>
                      <h2 className="py-2 text-lg font-semibold">Người lập</h2>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?bold=true&background=random&name=${contract.createdByUser.fullName}`}
                              alt={contract.createdByUser.fullName}
                            />
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{contract.createdByUser.fullName} ({contract.createdByUser.code})</div>
                            <div className="text-xs text-muted-foreground">{dateFormat(contract.createdAt, true)}</div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-primary">
                            <MobileIcon className="mr-2 h-4 w-4" />
                            <a href={`tel:${contract.createdByUser.phone}`}>{contract.createdByUser.phone}</a>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="mr-2 h-4 w-4" />
                            <a href={`mailto:${contract.createdByUser.email}`}>{contract.createdByUser.email}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-row flex-wrap items-center justify-center sm:justify-end gap-2 !space-x-0 p-4 pt-0">
          {contract?.status === 'confirmed' && (
            <Button size="sm" onClick={() => setShowLiquidationDialog(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
              Thanh lý
            </Button>
          )}

          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>

        {showLiquidationDialog && (
          <LiquidatePurchaseContractDialog
            open={showLiquidationDialog}
            onOpenChange={setShowLiquidationDialog}
            contractId={purchaseContractId}
            contentClassName="z-[10006]"
            overlayClassName="z-[10005]"
            onSuccess={() => {
              fetchContractDetail()
            }}
          />
        )}

        {selectedProductId && (
          <ViewProductDialog
            open={showViewProductDialog}
            onOpenChange={setShowViewProductDialog}
            productId={selectedProductId}
            showTrigger={false}
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
          />
        )}

        {selectedPurchaseOrderId && (
          <ViewPurchaseOrderDialog
            open={showViewPurchaseOrderDialog}
            onOpenChange={setShowViewPurchaseOrderDialog}
            purchaseOrderId={selectedPurchaseOrderId}
            showTrigger={false}
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
          />
        )}

        {selectedWarehouseReceiptId && (
          <ViewWarehouseReceiptDialog
            open={showViewWarehouseReceiptDialog}
            onOpenChange={setShowViewWarehouseReceiptDialog}
            receiptId={selectedWarehouseReceiptId}
            showTrigger={false}
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
          />
        )}

        {selectedPaymentId && (
          <ViewPaymentDialog
            open={showViewPaymentDialog}
            onOpenChange={setShowViewPaymentDialog}
            paymentId={selectedPaymentId}
            showTrigger={false}
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
          />
        )}

        {/* Update Purchase Order Status Dialog */}
        {selectedPurchaseOrderForUpdate && (
          <UpdatePurchaseOrderStatusDialog
            open={showUpdatePurchaseOrderStatus}
            onOpenChange={setShowUpdatePurchaseOrderStatus}
            purchaseOrderId={selectedPurchaseOrderForUpdate.id}
            currentStatus={selectedPurchaseOrderForUpdate.status}
            statuses={purchaseOrderStatuses}
            onSubmit={handleUpdatePurchaseOrderStatus}
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
            selectContentClassName="z-[100065]"
          />
        )}

        {selectedPaymentForUpdate && (
          <UpdatePaymentStatusDialog
            open={showUpdatePaymentStatus}
            onOpenChange={setShowUpdatePaymentStatus}
            paymentId={selectedPaymentForUpdate.code || selectedPaymentForUpdate.id}
            currentStatus={selectedPaymentForUpdate.status}
            statuses={paymentStatus}
            onSubmit={(status) => handleUpdatePaymentStatus(status, selectedPaymentForUpdate.id)}
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
            selectContentClassName="z-[100065]"
          />
        )}

        {/* Delete Payment Dialog */}
        {paymentToDelete && (
          <DeletePaymentDialog
            open={showDeletePaymentDialog}
            onOpenChange={setShowDeletePaymentDialog}
            payment={paymentToDelete}
            showTrigger={false}
            onSuccess={() => {
              setShowDeletePaymentDialog(false)
              fetchContractDetail()
            }}
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
          />
        )}

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
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
          />
        )}

        {selectedWarehouseReceiptForUpdate && (
          <UpdateWarehouseReceiptStatusDialog
            open={showUpdateWarehouseReceiptStatus}
            onOpenChange={setShowUpdateWarehouseReceiptStatus}
            receiptId={selectedWarehouseReceiptForUpdate.id}
            receiptCode={selectedWarehouseReceiptForUpdate.code}
            currentStatus={selectedWarehouseReceiptForUpdate.status}
            statuses={warehouseReceiptStatuses}
            onSubmit={handleUpdateWarehouseReceiptStatus}
            contentClassName="!z-[100060]"
            overlayClassName="z-[100059]"
            selectContentClassName="z-[100065]"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewPurchaseContractDialog