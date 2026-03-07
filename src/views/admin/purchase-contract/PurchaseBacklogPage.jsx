
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
import { FileSpreadsheet, Phone, Building2 } from 'lucide-react'
import { IconId } from '@tabler/icons-react'
import { Button } from '@/components/custom/Button'
import ExportPurchaseBacklogPreviewDialog from './components/ExportPurchaseBacklogPreviewDialog'

const PurchaseBacklogPage = () => {
  const dispatch = useDispatch()
  const { purchaseBacklog: data, purchaseBacklogPagination: pagination, loading } = useSelector((state) => state.report)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [showExportPreview, setShowExportPreview] = useState(false)

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
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-4 px-1 sm:mx-0 sm:px-0">
          <h2 className="text-2xl font-bold tracking-tight">Đơn mua chưa nhận</h2>
          <Button
            variant="outline"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full sm:w-auto"
            onClick={() => setShowExportPreview(true)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Báo Cáo
          </Button>
        </div>

        {showExportPreview && (
          <ExportPurchaseBacklogPreviewDialog
            open={showExportPreview}
            onOpenChange={setShowExportPreview}
            data={data}
          />
        )}

        <div className="-mx-4 px-1 sm:px-4 flex-1 overflow-auto rounded-md border mb-4">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-secondary">
              <TableRow>
                <TableHead>Mã ĐH</TableHead>
                <TableHead className="w-[200px]">Nhà cung cấp / Khách hàng</TableHead>
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
                  // Convert both Case 1 and Case 2 into a flat list of orders
                  if (record.items && record.items.length > 0) {
                    return [record]
                  }
                  if (record.purchaseOrders && record.purchaseOrders.length > 0) {
                    return record.purchaseOrders.map((order) => ({
                      ...order,
                      supplier: record.supplier || order.supplier,
                      customer: record.customer || order.customer,
                      supplierName: record.supplierName || order.supplierName,
                      customerName: record.customerName || order.customerName,
                      supplierPhone: record.supplierPhone || order.supplierPhone,
                      customerPhone: record.customerPhone || order.customerPhone,
                    }))
                  }
                  return []
                }).map((order) => {
                  const orderTotal = Number(order.totalAmount) || 0
                  const orderPaid = Number(order.paidAmount) || 0
                  const remainingAmount = orderTotal - orderPaid

                  return (
                    <TableRow key={order.id}>
                      <TableCell
                        className="font-medium cursor-pointer text-primary hover:underline align-middle"
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setShowViewOrderDialog(true)
                        }}
                      >
                        {order.code}
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="font-semibold">
                          {order.supplier?.name || order.customer?.name || order.supplierName || order.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-1">
                          {order.supplier?.phone || order.customer?.phone || order.supplierPhone || order.customerPhone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{order.supplier?.phone || order.customer?.phone || order.supplierPhone || order.customerPhone}</span>
                            </div>
                          ) : null}
                          {order.supplier?.taxCode ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span>{order.supplier.taxCode}</span>
                            </div>
                          ) : null}
                          {order.customer?.identityCard ? (
                            <div className="flex items-center gap-1">
                              <IconId className="h-3 w-3" />
                              <span>{order.customer.identityCard}</span>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex flex-col gap-2">
                          {order.items?.map((item) => {
                            const orderedQty = Number(item.quantity) || 0
                            const receivedQty = Number(item.receivedQuantity) || 0
                            return (
                              <div key={item.id} className="pb-2 border-b last:border-0 last:pb-0">
                                <div className="text-sm font-medium">
                                  {item.productName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Đã nhận: {receivedQty} / {orderedQty} {item.unitName}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        {order.expectedDeliveryDate
                          ? format(new Date(order.expectedDeliveryDate), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        {moneyFormat(orderTotal)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 align-middle">
                        {moneyFormat(orderPaid)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 align-middle">
                        {moneyFormat(remainingAmount)}
                      </TableCell>
                    </TableRow>
                  )
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
