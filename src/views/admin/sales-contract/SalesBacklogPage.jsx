
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

import { DataTablePagination } from '../invoice/components/DataTablePagination'
import { FileSpreadsheet, Phone } from 'lucide-react'
import { IconId } from '@tabler/icons-react'
import { Button } from '@/components/custom/Button'
import ExportSalesBacklogPreviewDialog from './components/ExportSalesBacklogPreviewDialog'

const SalesBacklogPage = () => {
  const dispatch = useDispatch()
  const { salesBacklog: data, salesBacklogPagination: pagination, loading } = useSelector((state) => state.report)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [showExportPreview, setShowExportPreview] = useState(false)

  useEffect(() => {
    dispatch(getSalesBacklog({ page, limit }))
  }, [dispatch, page, limit])

  // Mock table object for DataTablePagination
  const table = {
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getFilteredRowModel: () => ({ rows: data || [] }),
    getState: () => ({
      pagination: {
        pageSize: limit,
        pageIndex: page - 1,
      },
    }),
    setPageSize: (newPageSize) => {
      setLimit(newPageSize)
      setPage(1)
    },
    setPageIndex: (newPageIndex) => {
      setPage(newPageIndex + 1)
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
          <h2 className="text-2xl font-bold tracking-tight">Đơn bán chưa giao</h2>
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
          <ExportSalesBacklogPreviewDialog
            open={showExportPreview}
            onOpenChange={setShowExportPreview}
            data={data}
          />
        )}

        {selectedInvoiceId && (
          <ViewInvoiceDialog
            open={showViewInvoiceDialog}
            onOpenChange={setShowViewInvoiceDialog}
            invoiceId={selectedInvoiceId}
            showTrigger={false}
          />
        )}

        <div className="-mx-4 px-1 sm:px-4 flex-1 overflow-auto rounded-md border mb-4">
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
              ) : data && data.length > 0 ? (
                data.map((contract) => {
                  const contractTotal = Number(contract.totalAmount) || 0
                  const contractPaid = Number(contract.paidAmount) || 0
                  const itemRemaining = contractTotal - contractPaid

                  return (
                    <TableRow key={contract.id}>
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
                          {contract.customer?.name || contract.buyerName}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-1">
                          {contract.customer?.phone || contract.buyerPhone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{contract.customer?.phone || contract.buyerPhone}</span>
                            </div>
                          ) : null}
                          {contract.customer?.identityCard ? (
                            <div className="flex items-center gap-1">
                              <IconId className="h-3 w-3" />
                              <span>{contract.customer.identityCard}</span>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {contract.items?.map((item) => {
                            const orderedQty = Number(item.quantity) || 0
                            const deliveredQty = Number(item.deliveredQuantity) || 0
                            return (
                              <div key={item.id} className="pb-2 border-b last:border-0 last:pb-0">
                                <div className="text-sm font-medium">
                                  {item.productName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Đã giao: {deliveredQty} / {orderedQty}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        {contract.expectedDeliveryDate
                          ? format(new Date(contract.expectedDeliveryDate), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        {moneyFormat(contractTotal)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 align-middle">
                        {moneyFormat(contractPaid)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 align-middle">
                        {moneyFormat(itemRemaining)}
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
                    <EmptyState description="Không có đơn hàng nào chưa giao" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </LayoutBody>
    </Layout>
  )
}

export default SalesBacklogPage
