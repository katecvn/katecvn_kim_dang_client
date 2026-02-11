
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
import { DataTablePagination } from '../invoice/components/DataTablePagination'

const PurchaseBacklogPage = () => {
  const dispatch = useDispatch()
  const { purchaseBacklog: data, purchaseBacklogPagination: pagination, loading } = useSelector((state) => state.report)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  useEffect(() => {
    dispatch(getPurchaseBacklog({ page, limit }))
  }, [dispatch, page, limit])

  // Mock table object for DataTablePagination
  const table = {
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getFilteredRowModel: () => ({ rows: data || [] }),
    getState: () => ({
      pagination: {
        pageSize: limit,
        pageIndex: page - 1, // 0-indexed for table
      },
    }),
    setPageSize: (newPageSize) => {
      setLimit(newPageSize)
      setPage(1) // Reset to first page
    },
    setPageIndex: (newPageIndex) => {
      setPage(newPageIndex + 1) // 1-indexed for API
    },
    getPageCount: () => pagination?.totalPages || 1,
    getCanPreviousPage: () => page > 1,
    getCanNextPage: () => page < (pagination?.totalPages || 1),
    previousPage: () => setPage((p) => Math.max(1, p - 1)),
    nextPage: () => setPage((p) => Math.min(pagination?.totalPages || 1, p + 1)),
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <h2 className="text-2xl font-bold tracking-tight">Đơn mua chưa nhận</h2>
        </div>

        <div className="flex-1 overflow-auto rounded-md border mb-4">
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
              ) : data && data.length > 0 ? (
                data.flatMap((record) => {
                  // Case 1: Direct items (New API structure or Sales Backlog style)
                  if (record.items && record.items.length > 0) {
                    return record.items.map((item) => {
                      const total = Number(item.totalAmount) || 0
                      const receivedQty = Number(item.receivedQuantity) || 0
                      const orderedQty = Number(item.quantity) || 0
                      const unitPrice = Number(item.unitPrice) || 0
                      const receivedAmount = receivedQty * unitPrice
                      const remainingAmount =
                        (orderedQty - receivedQty) * unitPrice

                      return (
                        <TableRow key={`${record.id}-${item.id}`}>
                          <TableCell
                            className="font-medium cursor-pointer text-primary hover:underline"
                            onClick={() => {
                              setSelectedOrderId(record.id)
                              setShowViewOrderDialog(true)
                            }}
                          >
                            {record.code}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              {record.supplierName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {record.supplierPhone}
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
                    })
                  }

                  // Case 2: Nested purchaseOrders (Legacy structure)
                  if (record.purchaseOrders && record.purchaseOrders.length > 0) {
                    return record.purchaseOrders.flatMap((order) =>
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
                            key={`${record.id}-${order.id}-${item.id}`}
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
                                {record.supplierName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {record.supplierPhone}
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
                      }) || []
                    )
                  }

                  return []
                })
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

        <DataTablePagination table={table} />

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
