import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  IconCurrencyDong,
  IconInvoice,
  IconUsersGroup,
} from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import { getStatistic } from '@/stores/StatisticSlice'
import { moneyFormat } from '@/utils/money-format'
import useSocketEvent from '@/hooks/UseSocketEvent'
import { Skeleton } from '@/components/ui/skeleton'
import MonthlyRevenue from './MonthlyRevenue'
import RecentSales from './RecentSales'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { getStatisticWithDate } from '@/api/statistic.jsx'
import CrmReportOverview from './CrmReportOverview'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const AdminReport = ({ fromDate, toDate }) => {
  const loading = useSelector((state) => state.statistic.loading)
  const [statistic, setStatistic] = useState(null)

  const dispatch = useDispatch()

  const eventHandlers = {
    create_invoice: () => dispatch(getStatistic()),
    update_invoice: () => dispatch(getStatistic()),
  }

  useSocketEvent(eventHandlers)

  useEffect(() => {
    dispatch(getStatistic())
  }, [dispatch])

  const fetchStatistics = useCallback(async () => {
    const data = await getStatisticWithDate(fromDate, toDate)
    setStatistic(data)
  }, [fromDate, toDate])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return (
    <div className="space-y-2">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan kinh doanh</TabsTrigger>
          <TabsTrigger value="crm">Chăm sóc khách hàng (CSKH)</TabsTrigger>
        </TabsList>

        {/* TAB 1: TỔNG QUAN */}
        <TabsContent value="overview" className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  DT trong tháng
                </CardTitle>
                <div className="h-4 w-4" title="Doanh thu trong tháng">
                  <IconCurrencyDong className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>

              <Link to="/invoice">
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[20px] w-full rounded-md" />
                  ) : (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">
                        +{moneyFormat(statistic?.currentMonthRevenue)}
                      </div>

                      <div
                        className={cn(
                          statistic?.currentMonthRevenue /
                            statistic?.totalRevenueBusinessPlan <
                            1
                            ? 'text-destructive'
                            : 'text-green-500',
                        )}
                      >
                        {statistic?.totalRevenueBusinessPlan ? (
                          `Đạt ${(
                            (statistic?.currentMonthRevenue /
                              statistic?.totalRevenueBusinessPlan) *
                            100
                          ).toFixed(2)}% so với kế hoạch`
                        ) : (
                          <span className="text-destructive">
                            Chưa lên kế hoạch kinh doanh
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  DT chưa duyệt trong tháng
                </CardTitle>
                <div
                  className="h-4 w-4"
                  title="Doanh thu chưa duyệt trong tháng"
                >
                  <IconInvoice className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>

              <Link to="/invoice">
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[20px] w-full rounded-md" />
                  ) : (
                    <div className="text-2xl font-bold">
                      +{moneyFormat(statistic?.currentMonthPendingRevenue)}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  KH mới công ty
                </CardTitle>
                <div className="h-4 w-4" title="Khách hàng mới công ty">
                  <IconUsersGroup className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>

              <Link to="/customer">
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[20px] w-full rounded-md" />
                  ) : (
                    <div className="text-2xl font-bold">
                      +{statistic?.customerOfKATEC}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  KH mới đối tác
                </CardTitle>
                <div className="h-4 w-4" title="Khách hàng mới đối tác">
                  <IconUsersGroup className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>

              <Link to="/customer">
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[20px] w-full rounded-md" />
                  ) : (
                    <div className="text-2xl font-bold">
                      +{statistic?.customerOfPartner}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 py-2 lg:grid-cols-12">
            <div className="h-auto lg:col-span-8">
              <MonthlyRevenue
                loading={loading}
                data={statistic?.businessPlan}
                fromDate={fromDate}
                toDate={toDate}
              />
            </div>

            <div className="h-auto lg:col-span-4">
              <RecentSales
                loading={loading}
                recentSales={statistic?.recentSales}
              />
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CSKH */}
        <TabsContent value="crm" className="pt-2">
          <CrmReportOverview />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminReport
