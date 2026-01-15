import EmptyState from '@/components/custom/EmptyState'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

const RecentSales = ({ recentSales, loading }) => {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
        <CardDescription>
          Bạn có {recentSales?.length} trong hôm nay
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[475px] space-y-4 overflow-y-auto px-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-[20px] w-full rounded-md" />
              </div>
            ))
          ) : recentSales?.length ? (
            recentSales?.map((invoice) => (
              <div className="flex items-center" key={invoice.code}>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?bold=true&background=random&name=${invoice?.customerName}`}
                    alt={invoice?.customerName}
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <div className="flex flex-col text-sm">
                    <span className="font-medium leading-none">
                      {invoice?.customerName}
                    </span>
                    <span className="text-muted-foreground">
                      <a
                        className="text-primary underline hover:text-secondary-foreground"
                        href={`mailto:${invoice?.customerEmail}`}
                      >
                        {invoice?.customerEmail}
                      </a>
                    </span>
                    <span className="text-muted-foreground">
                      <a href={`tel:${invoice?.customerPhone}`}>
                        {invoice?.customerPhone}
                      </a>
                    </span>
                  </div>
                </div>
                <div className="ml-auto text-sm font-medium">
                  {moneyFormat(invoice.amount)}
                </div>
              </div>
            ))
          ) : (
            <EmptyState />
          )}

          <div className="float-end">
            <Link
              className="flex items-center text-end text-primary"
              to={'/invoice'}
            >
              <div className="mr-2 h-4 w-4">
                <IconArrowRight className="h-4 w-4" />
              </div>
              Xem tất cả
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentSales
