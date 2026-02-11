
import React, { useEffect, useState } from 'react'
import Can from '@/utils/can'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import DashboardSummary from './components/DashboardSummary'
import MarketPriceWidget from './components/MarketPriceWidget'
import DailyRevenueChart from './components/DailyRevenueChart'
import BacklogWidget from './components/PendingOrders'
import RecentSales from './components/RecentSales'
import TransactionList from './components/TransactionList'
import api from '@/utils/axios'
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

const DashboardPage = () => {
  const userPermissions = JSON.parse(localStorage.getItem('permissionCodes')) || []
  const canViewReport = userPermissions.includes('GET_REPORT')

  const [salesSummary, setSalesSummary] = useState([])
  const [salesBacklog, setSalesBacklog] = useState([])
  const [purchaseBacklog, setPurchaseBacklog] = useState([])
  const [recentSales, setRecentSales] = useState([])

  // New State
  const [todayReceipts, setTodayReceipts] = useState([])
  const [todayPayments, setTodayPayments] = useState([])

  const [loading, setLoading] = useState(true)

  const current = new Date()
  const fromDate = startOfMonth(current)
  const toDate = endOfMonth(current)

  const todayStart = startOfDay(current)
  const todayEnd = endOfDay(current)

  useEffect(() => {
    document.title = 'Tổng quan - CRM'

    if (!canViewReport) return

    const fetchAllData = async () => {
      setLoading(true)
      try {
        const [salesRes, salesBacklogRes, purchaseBacklogRes, recentRes, receiptsTodayRes, paymentsTodayRes] = await Promise.all([
          api.get('/reports/sales/summary', { params: { fromDate, toDate } }),
          api.get('/reports/sales/backlog'),
          api.get('/reports/purchases/backlog'),
          api.get('/invoice', { params: { limit: 10, sort: 'createdAt:desc' } }),
          api.get('/payment-vouchers', {
            params: {
              voucherType: 'receipt_in',
              fromDate: todayStart,
              toDate: todayEnd,
              limit: 100
            }
          }),
          api.get('/payment-vouchers', {
            params: {
              voucherType: 'payment_out',
              fromDate: todayStart,
              toDate: todayEnd,
              limit: 100
            }
          })
        ])

        setSalesSummary(salesRes.data.data.data || [])
        setSalesBacklog(salesBacklogRes.data.data || [])

        // Map purchase backlog to match widget expectation
        const rawPurchaseBacklog = purchaseBacklogRes.data.data || []
        const mappedPurchaseBacklog = rawPurchaseBacklog.map(item => ({
          ...item,
          deliveryDate: item.purchaseOrders?.[0]?.expectedDeliveryDate,
          items: item.purchaseOrders?.flatMap(po => po.items) || []
        }))
        setPurchaseBacklog(mappedPurchaseBacklog)
        setRecentSales(recentRes.data.data.data || [])

        // Handle paginated response structure if necessary, or just data array
        // ReceiptSlice says: response.data.data || response.data
        const receiptsData = receiptsTodayRes.data.data?.data || receiptsTodayRes.data.data || []
        const paymentsData = paymentsTodayRes.data.data?.data || paymentsTodayRes.data.data || []

        setTodayReceipts(receiptsData)
        setTodayPayments(paymentsData)

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [canViewReport])

  // Calculate totals
  const todayIncome = todayReceipts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const todayExpense = todayPayments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  if (!canViewReport) {
    return (
      <Layout>
        <LayoutBody className="flex flex-col h-full" fixedHeight>
          <div className="flex items-center justify-center h-full">
            <h3 className="text-lg font-medium text-muted-foreground">Bạn không có quyền xem thống kê dashboard</h3>
          </div>
        </LayoutBody>
      </Layout>
    )
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col h-full" fixedHeight>
        <div className="flex-none flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-6 pb-8">
            <DashboardSummary
              todayIncome={todayIncome}
              todayExpense={todayExpense}
              loading={loading}
            />

            <DailyRevenueChart
              data={salesSummary}
              loading={loading}
              fromDate={fromDate}
              toDate={toDate}
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              <MarketPriceWidget />

              <TransactionList
                title={`Thu hôm nay (${todayReceipts.length})`}
                data={todayReceipts}
                type="receipt"
                loading={loading}
                description="Phiếu thu trong ngày"
              />

              <TransactionList
                title={`Chi hôm nay (${todayPayments.length})`}
                data={todayPayments}
                type="payment"
                loading={loading}
                description="Phiếu chi trong ngày"
              />

              <BacklogWidget
                title={`Chưa giao (${salesBacklog.length})`}
                data={salesBacklog}
                type="sale"
                loading={loading}
                description="Đơn bán chưa xuất kho"
              />

              <BacklogWidget
                title={`Chưa nhận (${purchaseBacklog.length})`}
                data={purchaseBacklog}
                type="purchase"
                loading={loading}
                description="Đơn mua chưa nhập kho"
              />

              <RecentSales
                recentSales={recentSales}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default DashboardPage
