
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
import { getSalesBacklog } from '@/stores/ReportSlice'
import ViewInvoiceDialog from '../invoice/components/ViewInvoiceDialog'
const SalesBacklogPage = () => {
  const dispatch = useDispatch()
  const { salesBacklog: data, loading } = useSelector((state) => state.report)

  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)

  useEffect(() => {
    dispatch(getSalesBacklog())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <h2 className="text-2xl font-bold tracking-tight">Đơn bán chưa giao</h2>
        </div>

        <div className="flex-1 overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-secondary">
              <TableRow>
                <TableHead>Mã ĐH</TableHead>
                <TableHead className="w-[200px]">Khách hàng</TableHead>
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
                    contract.items?.map((item) => {
                      // Calculate based on item-level data if available
                      const orderedQty = Number(item.quantity) || 0
                      const deliveredQty = Number(item.deliveredQuantity) || 0
                      const remainingQty = orderedQty - deliveredQty

                      // Use contract totals divided by number of items as approximation
                      const contractTotal = Number(contract.totalAmount) || 0
                      const contractPaid = Number(contract.paidAmount) || 0
                      const itemCount = contract.items?.length || 1
                      const itemTotal = contractTotal / itemCount
                      const itemPaid = contractPaid / itemCount
                      const itemRemaining = itemTotal - itemPaid

                      return (
                        <TableRow key={`${contract.id}-${item.id}`}>
                          <TableCell
                            className="font-medium cursor-pointer text-primary hover:underline"
                            onClick={() => {
                              setSelectedInvoiceId(contract.id)
                              setShowViewInvoiceDialog(true)
                            }}
                          >
                            {contract.code}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              {contract.buyerName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {contract.buyerPhone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {item.productName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Đã giao: {deliveredQty} / {orderedQty}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.promisedDeliveryDate
                              ? format(
                                new Date(item.promisedDeliveryDate),
                                'dd/MM/yyyy',
                              )
                              : contract.deliveryDate
                                ? format(
                                  new Date(contract.deliveryDate),
                                  'dd/MM/yyyy',
                                )
                                : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {moneyFormat(itemTotal)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {moneyFormat(itemPaid)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {moneyFormat(itemRemaining)}
                          </TableCell>
                        </TableRow>
                      )
                    }) || [],
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    <EmptyState description="Không có đơn hàng nào chưa giao" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ViewInvoiceDialog
          open={showViewInvoiceDialog}
          onOpenChange={setShowViewInvoiceDialog}
          invoiceId={selectedInvoiceId}
          showTrigger={false}
        />
      </LayoutBody>
    </Layout>
  )
}

export default SalesBacklogPage
