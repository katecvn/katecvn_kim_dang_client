
import React, { useEffect, useState } from 'react'
import Can from '@/utils/can'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import DashboardSummary from './components/DashboardSummary'
import MarketPriceWidget from './components/MarketPriceWidget'
import DailyRevenueChart from './components/DailyRevenueChart'
import PendingOrders from './components/PendingOrders'
import RecentSales from './components/RecentSales'
import api from '@/utils/axios'
import { startOfMonth, endOfMonth } from 'date-fns'

const DashboardPage = () => {
  const [salesSummary, setSalesSummary] = useState([])
  const [salesBacklog, setSalesBacklog] = useState([])
  const [purchaseBacklog, setPurchaseBacklog] = useState([])
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)

  const current = new Date()
  const fromDate = startOfMonth(current)
  const toDate = endOfMonth(current)

  useEffect(() => {
    document.title = 'Tổng quan - CRM'

    const fetchAllData = async () => {
      setLoading(true)
      try {
        const [salesRes, salesBacklogRes, purchaseBacklogRes, recentRes] = await Promise.all([
          api.get('/reports/sales/summary', { params: { fromDate, toDate } }),
          api.get('/reports/sales/backlog'),
          api.get('/reports/purchases/backlog'),
          api.get('/invoice', { params: { limit: 5, sort: 'createdAt:desc' } })
        ])

        setSalesSummary(salesRes.data.data.data || [])
        setSalesBacklog(salesBacklogRes.data.data || [])
        setPurchaseBacklog(purchaseBacklogRes.data.data || [])
        setRecentSales(recentRes.data.data || [])

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  return (
    <Layout>
      <LayoutBody className="flex flex-col h-full" fixedHeight>
        <div className="flex-none flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <Can permission={['GET_REPORT']}>
            <div className="space-y-6 pb-8">
              <DashboardSummary />

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-2 space-y-4">
                  <MarketPriceWidget />
                  {/* Can put Recent Sales here too if we want shorter left column */}
                </div>
                <div className="col-span-5 space-y-4">
                  <DailyRevenueChart
                    data={salesSummary}
                    loading={loading}
                    fromDate={fromDate}
                    toDate={toDate}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PendingOrders
                      salesBacklog={salesBacklog}
                      purchaseBacklog={purchaseBacklog}
                      loading={loading}
                    />
                    <RecentSales
                      recentSales={recentSales}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Can>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default DashboardPage
