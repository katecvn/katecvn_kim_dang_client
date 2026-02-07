import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getMyPurchaseOrders } from '@/stores/PurchaseOrderSlice'
import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getColumns } from './components/Column'
import PurchaseOrderDataTable from './components/PurchaseOrderDataTable'
import PurchaseOrderDialog from './components/PurchaseOrderDialog'
import ViewPurchaseOrderDialog from './components/ViewPurchaseOrderDialog'
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

  /* Pagination state matching PurchaseOrderPage */
  const pagination = useSelector((state) => state.purchaseOrder.pagination)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  const [viewPurchaseOrderId, setViewPurchaseOrderId] = useState(null)
  const [updatePurchaseOrderId, setUpdatePurchaseOrderId] = useState(null)
  const [showUpdatePurchaseOrderDialog, setShowUpdatePurchaseOrderDialog] = useState(false)

  const columns = useMemo(() => getColumns(setViewPurchaseOrderId), [])

  useEffect(() => {
    document.title = 'Đơn đặt hàng của tôi'
    const apiFilters = {
      ...filters,
      page: pageIndex + 1,
      limit: pageSize,
    }
    dispatch(getMyPurchaseOrders(apiFilters))
  }, [dispatch, filters, pageIndex, pageSize])

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
                setPageIndex(0) // Reset to first page
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
              onView={setViewPurchaseOrderId}
              /* Pagination Props */
              pageCount={pagination?.last_page || -1}
              pagination={{
                pageIndex,
                pageSize,
              }}
              onPaginationChange={(updater) => {
                if (typeof updater === 'function') {
                  const newState = updater({
                    pageIndex,
                    pageSize,
                  })
                  setPageIndex(newState.pageIndex)
                  setPageSize(newState.pageSize)
                } else {
                  setPageIndex(updater.pageIndex)
                  setPageSize(updater.pageSize)
                }
              }}
            />
          )}
        </div>

        {/* Auto-open ViewPurchaseOrderDialog from creation */}
        {viewPurchaseOrderId && (
          <ViewPurchaseOrderDialog
            open={!!viewPurchaseOrderId}
            onOpenChange={(open) => {
              if (!open) {
                setViewPurchaseOrderId(null)
              }
            }}
            purchaseOrderId={viewPurchaseOrderId}
            showTrigger={false}
            onEdit={() => {
              setUpdatePurchaseOrderId(viewPurchaseOrderId)
              setViewPurchaseOrderId(null)
              setTimeout(() => {
                setShowUpdatePurchaseOrderDialog(true)
              }, 100)
            }}
            onRefresh={() => {
              const apiFilters = {
                ...filters,
                page: pageIndex + 1,
                limit: pageSize,
              }
              dispatch(getMyPurchaseOrders(apiFilters))
            }}
          />
        )}

        {/* Update Purchase Order Dialog */}
        {showUpdatePurchaseOrderDialog && updatePurchaseOrderId && (
          <PurchaseOrderDialog
            open={showUpdatePurchaseOrderDialog}
            onOpenChange={setShowUpdatePurchaseOrderDialog}
            purchaseOrderId={updatePurchaseOrderId}
            showTrigger={false}
          />
        )}
      </LayoutBody>
    </Layout>
  )
}

export default MyPurchaseOrderPage
