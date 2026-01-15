'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format.jsx'

const config = {
  target: {
    label: 'Chỉ tiêu',
    color: 'hsl(var(--chart-1))',
  },
  perform: {
    label: 'Thực hiện',
    color: 'hsl(var(--chart-6))',
  },
}

const MonthlyRevenue = ({ data = [], loading = false, fromDate, toDate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kế hoạch thực hiện tháng</CardTitle>
        <CardDescription>
          Từ {dateFormat(fromDate)} đến {dateFormat(toDate)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={475}>
          <ChartContainer config={config}>
            {loading || !data || !data.length ? (
              <div className="flex items-center gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton className="h-full w-full rounded-md" key={index} />
                ))}
              </div>
            ) : (
              <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={true}
                  tickMargin={12}
                  axisLine={true}
                />
                <ChartTooltip
                  cursor={true}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="target"
                  fill="var(--color-target)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="perform"
                  fill="var(--color-perform)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default MonthlyRevenue
