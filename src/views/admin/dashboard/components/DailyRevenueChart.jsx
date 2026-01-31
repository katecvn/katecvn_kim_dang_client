import React, { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { format } from 'date-fns'

const DailyRevenueChart = ({ data, loading, fromDate, toDate }) => {

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map(item => ({
      date: format(new Date(item.period), 'dd/MM'),
      fullDate: format(new Date(item.period), 'dd/MM/yyyy'),
      revenue: Number(item.totalSales) || 0,
      paid: Number(item.totalPaid) || 0,
      count: item.orderCount
    }))
  }, [data])

  return (
    <Card className="col-span-1 lg:col-span-4 shadow-none">
      <CardHeader>
        <CardTitle>Doanh số theo ngày</CardTitle>
        <CardDescription>
          Chi tiết doanh thu và thực thu ({dateFormat(fromDate)} - {dateFormat(toDate)})
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
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
              <Legend />
              <Bar dataKey="revenue" fill="#adfa1d" radius={[4, 4, 0, 0]} name="Doanh số" />
              <Bar dataKey="paid" fill="#16a34a" radius={[4, 4, 0, 0]} name="Thực thu" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyRevenueChart
