
import EmptyState from '@/components/custom/EmptyState'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { moneyFormat } from '@/utils/money-format'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPurchaseBacklog } from '@/stores/ReportSlice'
import ViewPurchaseOrderDialog from '../purchase-order/components/ViewPurchaseOrderDialog'

const PurchaseBacklogPage = () => {
  const dispatch = useDispatch()
  const { purchaseBacklog: data, loading } = useSelector((state) => state.report)

  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  useEffect(() => {
    dispatch(getPurchaseBacklog())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <h2 className="text-2xl font-bold tracking-tight">Đơn mua chưa nhận</h2>
        </div>

        <div className="flex-1 overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-secondary">
              <TableRow>
                <TableHead>Mã ĐH</TableHead>
                <TableHead className="w-[200px]">Nhà cung cấp</TableHead>
                <TableHead className="min-w-[300px]">Sản phẩm</TableHead>
                <TableHead className="text-center">Ngày hẹn</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-right">Đã trả</TableHead>
                <TableHead className="text-right">Còn lại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data.length > 0 ? (
                data.flatMap(
                  (contract) =>
                    contract.purchaseOrders?.flatMap(
                      (order) =>
                        order.items?.map((item) => {
                          const total = Number(item.totalAmount) || 0
                          const receivedQty = Number(item.receivedQuantity) || 0
                          const orderedQty = Number(item.quantity) || 0
                          const unitPrice = Number(item.unitPrice) || 0
                          const receivedAmount = receivedQty * unitPrice
                          const remainingAmount =
                            (orderedQty - receivedQty) * unitPrice

                          return (
                            <TableRow
                              key={`${contract.id}-${order.id}-${item.id}`}
                            >
                              <TableCell
                                className="font-medium cursor-pointer text-primary hover:underline"
                                onClick={() => {
                                  setSelectedOrderId(order.id)
                                  setShowViewOrderDialog(true)
                                }}
                              >
                                {order.code}
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold">
                                  {contract.supplierName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {contract.supplierPhone}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium">
                                  {item.productName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Đã nhận: {receivedQty} / {orderedQty}{' '}
                                  {item.unitName}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {item.expectedDeliveryDate
                                  ? format(
                                    new Date(item.expectedDeliveryDate),
                                    'dd/MM/yyyy',
                                  )
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {moneyFormat(total)}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {moneyFormat(receivedAmount)}
                              </TableCell>
                              <TableCell className="text-right text-red-600">
                                {moneyFormat(remainingAmount)}
                              </TableCell>
                            </TableRow>
                          )
                        }) || [],
                    ) || [],
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    <EmptyState description="Không có đơn mua nào chưa nhận" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedOrderId && (
          <ViewPurchaseOrderDialog
            open={showViewOrderDialog}
            onOpenChange={setShowViewOrderDialog}
            purchaseOrderId={selectedOrderId}
            showTrigger={false}
          />
        )}
      </LayoutBody>
    </Layout>
  )
}

export default PurchaseBacklogPage
