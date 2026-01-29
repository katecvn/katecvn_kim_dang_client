import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getMyPurchaseContracts } from '@/stores/PurchaseContractSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import PurchaseContractDataTable from './components/PurchaseContractDataTable'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'

const MyPurchaseContractPage = () => {
  const dispatch = useDispatch()
  const contracts = useSelector((state) => state.purchaseContract.contracts)
  const loading = useSelector((state) => state.purchaseContract.loading)
  // My contracts usually don't have pagination in some impls, 
  // but slice 'pagination' state is shared or overridden.
  // getMyPurchaseContracts in slice updates 'contracts' but maybe not pagination?
  // Checking slice: getMyPurchaseContracts.fulfilled updates state.contracts = action.payload
  // It assumes payload is array? SalesContractSlice: 
  // .addCase(getMySalesContracts.fulfilled, (state, action) => { state.contracts = action.payload })
  // So likely no server pagination for "My" view or it's handled differently.
  // I will assume no pagination for now or client side if data is array.
  // But PurchaseContractDataTable handles pagination.
  // If no pagination provided, it defaults to page 1.

  const pagination = { page: 1, limit: 100, totalPages: 1 } // Dummy or derived?
  // Actually, let's look at SalesContractSlice again.
  // getMySalesContracts returns 'data' which is action.payload.
  // If contracts is just array, the table might crash if it expects object?
  // Table expcets 'data' prop to be array.

  const current = new Date()

  // Filters state
  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  useEffect(() => {
    document.title = 'Hợp đồng mua hàng của tôi'
    dispatch(getMyPurchaseContracts(filters))
  }, [dispatch, filters])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Hợp đồng mua hàng của tôi
            </h2>
            <p className="text-muted-foreground">
              Quản lý các hợp đồng mua hàng do bạn tạo
            </p>
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
          {contracts && (
            <PurchaseContractDataTable
              data={contracts}
              columns={columns}
              loading={loading}
              pagination={pagination}
            // No paging controls for "My" if API doesn't support it
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MyPurchaseContractPage
