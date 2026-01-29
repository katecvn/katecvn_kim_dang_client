import React, { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { moneyFormat } from '@/utils/money-format'
import { useDispatch, useSelector } from 'react-redux'
import { getPurchaseOrders } from '@/stores/PurchaseOrderSlice'
import { eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { IconShoppingCart } from '@tabler/icons-react'

const PurchaseStats = ({ fromDate, toDate }) => {
  const dispatch = useDispatch()
  const purchaseOrders = useSelector((state) => state.purchaseOrder.purchaseOrders)
  const loading = useSelector((state) => state.purchaseOrder.loading)

  const [chartData, setChartData] = useState([])
  const [totalPurchase, setTotalPurchase] = useState(0)

  useEffect(() => {
    if (fromDate && toDate) {
      dispatch(getPurchaseOrders({ fromDate, toDate }))
    }
  }, [dispatch, fromDate, toDate])

  useEffect(() => {
    if (!purchaseOrders || !fromDate || !toDate) return

    const days = eachDayOfInterval({ start: fromDate, end: toDate })
    let sumTotal = 0

    const aggregated = days.map(day => {
      const dayOrders = purchaseOrders.filter(order => {
        // Filter: count confirmed orders or all?
        // Usually for stats we want Confirmed/Completed
        if (order.status === 'cancelled') return false

        const orderDate = parseISO(order.createdAt)
        return isSameDay(orderDate, day)
      })

      const dayTotal = dayOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
      sumTotal += dayTotal

      return {
        date: format(day, 'dd/MM', { locale: vi }),
        fullDate: format(day, 'dd/MM/yyyy'),
        amount: dayTotal,
        count: dayOrders.length
      }
    })

    setChartData(aggregated)
    setTotalPurchase(sumTotal)

  }, [purchaseOrders, fromDate, toDate])

  return (
    <div className="space-y-4">
      {/* Total Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng tiền mua (Tháng)
          </CardTitle>
          <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-2xl font-bold">
              {moneyFormat(totalPurchase)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Dữ liệu tính toán từ các đơn mua hàng không bị hủy
          </p>
        </CardContent>
      </Card>

      {/* Daily Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiền mua hàng theo ngày</CardTitle>
          <CardDescription>
            Chi tiết tiền mua theo ngày
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {loading ? (
            <div className="h-[250px] flex items-center justify-center">
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return payload[0].payload.fullDate
                    }
                    return label
                  }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tiền mua" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PurchaseStats
