
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { moneyFormat } from '@/utils/money-format'
import { IconArrowRight } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

const RecentSales = ({ recentSales = [], loading = false }) => {
  return (
    <Card className="col-span-1 shadow-none border-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
        <CardDescription>
          Giao dịch bán hàng mới nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-[40px] w-[40px] rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-[10px] w-[150px] rounded-md" />
                  <Skeleton className="h-[10px] w-[100px] rounded-md" />
                </div>
              </div>
            ))
          ) : recentSales?.length ? (
            recentSales.map((invoice) => (
              <div className="flex items-center justify-between border-b pb-2 last:border-0" key={invoice.id}>
                <div className="flex flex-col gap-1">
                  <div className="font-medium text-sm">{invoice?.buyerName || invoice?.customerName || 'Khách lẻ'}</div>
                  <div className="text-xs text-muted-foreground">{invoice?.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{moneyFormat(invoice.totalAmount)}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(invoice.createdAt), 'dd/MM HH:mm')}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">Chưa có giao dịch nào</div>
          )}

          <div className="pt-2">
            <Link
              className="flex items-center justify-center text-sm text-primary hover:underline"
              to={'/invoice'}
            >
              Xem tất cả đơn hàng
              <IconArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentSales
