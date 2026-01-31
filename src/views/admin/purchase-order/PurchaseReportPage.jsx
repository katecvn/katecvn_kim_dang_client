
import { DateRange } from '@/components/custom/DateRange'
import EmptyState from '@/components/custom/EmptyState'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/utils/axios'
import { moneyFormat } from '@/utils/money-format'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import React, { useCallback, useEffect, useState } from 'react'

const PurchaseReportPage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  const current = new Date()
  const [filters, setFilters] = useState({
    fromDate: startOfMonth(current),
    toDate: endOfMonth(current),
  })

  const fetchRevenue = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/reports/purchases/summary', {
        params: {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        },
      })
      setData(data.data)
      setLoading(false)
    } catch (error) {
      console.log('Submit error: ', error)
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchRevenue()
  }, [fetchRevenue])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <h2 className="text-2xl font-bold tracking-tight">Báo cáo tiền mua</h2>
          <div>
            <DateRange
              defaultValue={{
                from: filters?.fromDate,
                to: filters?.toDate,
              }}
              onChange={(range) => {
                setFilters((prev) => ({
                  ...prev,
                  fromDate: range?.from || startOfMonth(current),
                  toDate: range?.to || endOfMonth(current),
                }))
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Tổng đơn mua"
              value={data?.totals?.totalOrders}
              loading={loading}
            />
            <SummaryCard
              title="Tổng tiền mua"
              value={data?.totals?.grandTotalPurchase}
              isMoney
              loading={loading}
            />
            <SummaryCard
              title="Đã thanh toán"
              value={data?.totals?.grandTotalPaid}
              isMoney
              loading={loading}
              className="text-green-600"
            />
            <SummaryCard
              title="Chưa thanh toán"
              value={data?.totals?.grandTotalUnpaid}
              isMoney
              loading={loading}
              className="text-red-600"
            />
          </div>

          {/* Daily Sales Table */}
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Ngày
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                      Số đơn mua
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Tiền mua
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Đã thanh toán
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Chưa thanh toán
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b transition-colors">
                        <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-[50px] mx-auto" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-[100px] ml-auto" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-[100px] ml-auto" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-[100px] ml-auto" /></td>
                      </tr>
                    ))
                  ) : data?.data && data.data.length > 0 ? (
                    data.data.map((item, index) => {
                      const totalPurchase = Number(item.totalPurchase) || 0
                      const totalPaid = Number(item.totalPaid) || 0
                      const unpaid = totalPurchase - totalPaid

                      return (
                        <tr
                          key={index}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">
                            {format(new Date(item.period), 'dd/MM/yyyy')}
                          </td>
                          <td className="p-4 align-middle text-center">
                            {item.orderCount}
                          </td>
                          <td className="p-4 align-middle text-right font-medium">
                            {moneyFormat(totalPurchase)}
                          </td>
                          <td className="p-4 align-middle text-right text-green-600">
                            {moneyFormat(totalPaid)}
                          </td>
                          <td className="p-4 align-middle text-right text-red-600">
                            {moneyFormat(unpaid)}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        <EmptyState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  )
}

const SummaryCard = ({ title, value, isMoney = false, loading = false, className = '' }) => {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 pt-6">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        {loading ? (
          <Skeleton className="h-8 w-[100px] mt-2" />
        ) : (
          <div className={`text-2xl font-bold mt-2 ${className}`}>
            {isMoney ? moneyFormat(Number(value) || 0) : (value || 0)}
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchaseReportPage
