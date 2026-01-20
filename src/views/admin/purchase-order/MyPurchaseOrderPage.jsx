import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getMyPurchaseOrders } from '@/stores/PurchaseOrderSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import PurchaseOrderDataTable from './components/PurchaseOrderDataTable'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'

const MyPurchaseOrderPage = () => {
  const dispatch = useDispatch()
  const purchaseOrders = useSelector((state) => state.purchaseOrder.purchaseOrders)
  const loading = useSelector((state) => state.purchaseOrder.loading)
  const current = new Date()

  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  useEffect(() => {
    document.title = 'Đơn đặt hàng của tôi'
    dispatch(getMyPurchaseOrders(filters))
  }, [dispatch, filters])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Đơn đặt hàng của tôi
            </h2>
          </div>
          <div>
            <DateRange
              defaultValue={{
                from: filters?.fromDate,
                to: filters?.toDate,
              }}
              onChange={(range) => {
                setFilters((prev) => ({
                  ...prev,
                  fromDate: range?.from
                    ? addHours(startOfDay(range.from), 12)
                    : addHours(startOfDay(startOfMonth(current)), 12),
                  toDate: range?.to
                    ? addHours(endOfDay(range.to), 0)
                    : addHours(endOfDay(endOfMonth(current)), 0),
                }))
              }}
            />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {purchaseOrders && (
            <PurchaseOrderDataTable
              data={purchaseOrders}
              columns={columns}
              loading={loading}
              isMyPurchaseOrder={true}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MyPurchaseOrderPage
