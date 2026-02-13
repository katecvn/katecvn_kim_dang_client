
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/utils/axios'
import { moneyFormat } from '@/utils/money-format'
import { IconArrowUp, IconArrowDown, IconShoppingCart, IconTruckDelivery } from '@tabler/icons-react'

const DashboardSummary = ({ todayIncome = 0, todayExpense = 0, loading: parentLoading = false }) => {
  const [data, setData] = useState(null)
  const [internalLoading, setInternalLoading] = useState(true)

  const isLoading = parentLoading || internalLoading

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/reports/dashboard')
        setData(res.data.data)
      } catch (error) {
        console.error('Failed to fetch dashboard summary', error)
      } finally {
        setInternalLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard
        title="Thu hôm nay"
        value={moneyFormat(todayIncome)}
        subValue="Tổng tiền thu thực tế"
        icon={<IconArrowUp className="h-4 w-4 text-emerald-600" />}
      />
      <SummaryCard
        title="Chi hôm nay"
        value={moneyFormat(todayExpense)}
        subValue="Tổng tiền chi thực tế"
        icon={<IconArrowDown className="h-4 w-4 text-rose-600" />}
      />

      <SummaryCard
        title="Doanh số hôm nay"
        value={moneyFormat(data.salesToday)}
        subValue={`Tháng này: ${moneyFormat(data.salesMonth)}`}
        icon={<IconShoppingCart className="h-4 w-4 text-blue-500" />}
      />
      <SummaryCard
        title="Tiền mua hôm nay"
        value={moneyFormat(data.purchasesToday)}
        subValue={`Tháng này: ${moneyFormat(data.purchasesMonth)}`}
        icon={<IconTruckDelivery className="h-4 w-4 text-orange-500" />}
      />

      <SummaryCard
        title="Đơn bán"
        value={data.salesBacklogCount}
        subValue="Đơn hàng"
        icon={<IconShoppingCart className="h-4 w-4 text-orange-500" />}
      />
      <SummaryCard
        title="Đơn mua"
        value={data.purchaseBacklogCount}
        subValue="Đơn hàng"
        icon={<IconTruckDelivery className="h-4 w-4 text-blue-500" />}
      />
    </div>
  )
}

const SummaryCard = ({ title, value, subValue, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent className="min-w-0">
      <div
        className="text-lg font-bold sm:text-2xl"
        title={value}
      >
        {value}
      </div>
      <p className="text-xs text-muted-foreground">
        {subValue}
      </p>
    </CardContent>
  </Card>
)

export default DashboardSummary
