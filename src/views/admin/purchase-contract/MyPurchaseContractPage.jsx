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
import { useDebounce } from '@/hooks/useDebounce'

const MyPurchaseContractPage = () => {
  const dispatch = useDispatch()
  const pagination = useSelector((state) => state.purchaseContract.pagination)
  const contracts = useSelector((state) => state.purchaseContract.contracts)
  const loading = useSelector((state) => state.purchaseContract.loading)
  const current = new Date()

  const [pageParams, setPageParams] = useState({
    page: 1,
    limit: 20
  })

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  // Filters state
  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  const [columnFilters, setColumnFilters] = useState([])

  useEffect(() => {
    document.title = 'Hợp đồng mua hàng của tôi'
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value
    const paymentStatusFilter = columnFilters.find((f) => f.id === 'paymentStatus')?.value

    dispatch(getMyPurchaseContracts({
      ...filters,
      ...pageParams,
      search: debouncedSearch,
      status: statusFilter,
      paymentStatus: paymentStatusFilter
    }))
  }, [dispatch, filters, pageParams, debouncedSearch, columnFilters])

  // Reset page when search changes
  useEffect(() => {
    setPageParams(prev => ({ ...prev, page: 1 }))
  }, [debouncedSearch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 -mx-4 px-1 flex flex-col sm:mx-0 sm:px-0 sm:flex-row sm:items-center justify-between gap-2">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl font-bold tracking-tight">
              Hợp đồng mua hàng của tôi
            </h2>
            <p className="text-muted-foreground hidden sm:block">
              Quản lý các hợp đồng mua hàng do bạn tạo
            </p>
          </div>
          <div className="w-full sm:w-auto">
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
                // Reset to page 1 on filter change
                setPageParams(prev => ({ ...prev, page: 1 }))
              }}
            />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-1 sm:px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {contracts && (
            <PurchaseContractDataTable
              data={contracts}
              columns={columns}
              loading={loading}
              pagination={pagination}
              onPageChange={(page) => setPageParams(prev => ({ ...prev, page }))}
              onPageSizeChange={(limit) => setPageParams(prev => ({ ...prev, limit, page: 1 }))}
              onSearchChange={(value) => {
                setSearch(value)
              }}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              isMyPurchaseContract={true}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MyPurchaseContractPage
