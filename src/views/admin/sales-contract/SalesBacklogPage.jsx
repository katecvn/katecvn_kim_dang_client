
import EmptyState from '@/components/custom/EmptyState'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import { moneyFormat } from '@/utils/money-format'
import { format } from 'date-fns'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSalesBacklog } from '@/stores/ReportSlice'

const SalesBacklogPage = () => {
  const dispatch = useDispatch()
  const { salesBacklog: data, loading } = useSelector((state) => state.report)

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
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Mã ĐH</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">Khách hàng</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[300px]">Sản phẩm</th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Ngày hẹn</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Tổng tiền</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Đã trả</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Còn lại</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b transition-colors">
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[200px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                    </tr>
                  ))
                ) : data.length > 0 ? (
                  data.flatMap((contract) =>
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
                        <tr
                          key={`${contract.id}-${item.id}`}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle font-medium">{contract.code}</td>
                          <td className="p-4 align-middle">
                            <div className="font-semibold">{contract.buyerName}</div>
                            <div className="text-xs text-muted-foreground">{contract.buyerPhone}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="text-sm font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">
                              Đã giao: {deliveredQty} / {orderedQty}
                            </div>
                          </td>
                          <td className="p-4 align-middle text-center">
                            {item.promisedDeliveryDate
                              ? format(new Date(item.promisedDeliveryDate), 'dd/MM/yyyy')
                              : (contract.deliveryDate ? format(new Date(contract.deliveryDate), 'dd/MM/yyyy') : '-')}
                          </td>
                          <td className="p-4 align-middle text-right">{moneyFormat(itemTotal)}</td>
                          <td className="p-4 align-middle text-right text-green-600">{moneyFormat(itemPaid)}</td>
                          <td className="p-4 align-middle text-right text-red-600">{moneyFormat(itemRemaining)}</td>
                        </tr>
                      )
                    }) || []
                  )
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      <EmptyState description="Không có đơn hàng nào chưa giao" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default SalesBacklogPage
