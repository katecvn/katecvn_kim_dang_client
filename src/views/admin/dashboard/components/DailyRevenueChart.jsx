import React, { useEffect, useState, useMemo } from 'react'
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
import { dateFormat } from '@/utils/date-format'
import { useDispatch, useSelector } from 'react-redux'
import { getInvoices } from '@/stores/InvoiceSlice'
import { eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

const DailyRevenueChart = ({ fromDate, toDate }) => {
  const dispatch = useDispatch()
  const invoices = useSelector((state) => state.invoice.invoices)
  const loading = useSelector((state) => state.invoice.loading)

  // Local state to store processed chart data
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (fromDate && toDate) {
      dispatch(getInvoices({ fromDate, toDate }))
    }
  }, [dispatch, fromDate, toDate])

  useEffect(() => {
    if (!invoices || !fromDate || !toDate) return

    // 1. Generate all days in interval
    const days = eachDayOfInterval({ start: fromDate, end: toDate })

    // 2. Aggregate aggregated data
    const aggregated = days.map(day => {
      const dayInvoices = invoices.filter(inv => {
        if (inv.status === 'cancelled' || inv.status === 'draft') return false

        const invDate = parseISO(inv.createdAt)
        return isSameDay(invDate, day)
      })

      const total = dayInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0)

      return {
        date: format(day, 'dd/MM', { locale: vi }),
        fullDate: format(day, 'dd/MM/yyyy'),
        revenue: total,
        count: dayInvoices.length
      }
    })

    setChartData(aggregated)

  }, [invoices, fromDate, toDate])

  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle>Doanh số theo ngày</CardTitle>
        <CardDescription>
          Chi tiết doanh thu từng ngày trong kỳ ({dateFormat(fromDate)} - {dateFormat(toDate)})
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
              <Bar dataKey="revenue" fill="#adfa1d" radius={[4, 4, 0, 0]} name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyRevenueChart
