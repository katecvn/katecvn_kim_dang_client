
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
import ViewSalesContractDialog from './components/ViewSalesContractDialog'

import { DataTablePagination } from '../invoice/components/DataTablePagination'
import { FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import ExportSalesBacklogPreviewDialog from './components/ExportSalesBacklogPreviewDialog'

const SalesBacklogPage = () => {
  const dispatch = useDispatch()
  const { salesBacklog: data, salesBacklogPagination: pagination, loading } = useSelector((state) => state.report)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [showViewContractDialog, setShowViewContractDialog] = useState(false)
  const [selectedContractId, setSelectedContractId] = useState(null)
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
        <div className="mb-4 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <h2 className="text-2xl font-bold tracking-tight">Đơn bán chưa giao</h2>
          <Button
            variant="outline"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
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

        {selectedContractId && (
          <ViewSalesContractDialog
            open={showViewContractDialog}
            onOpenChange={setShowViewContractDialog}
            contractId={selectedContractId}
            showTrigger={false}
          />
        )}

        <div className="flex-1 overflow-auto rounded-md border mb-4">
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
                data.flatMap(
                  (contract) =>
                    contract.items?.map((item) => {
                      const orderedQty = Number(item.quantity) || 0
                      const deliveredQty = Number(item.deliveredQuantity) || 0
                      const remainingQty = orderedQty - deliveredQty

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
                              setSelectedContractId(contract.id)
                              setShowViewContractDialog(true)
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

        <DataTablePagination table={table} />
      </LayoutBody>
    </Layout>
  )
}

export default SalesBacklogPage
