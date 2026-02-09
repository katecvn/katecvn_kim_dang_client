import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getMySalesContracts } from '@/stores/SalesContractSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import SalesContractDataTable from './components/SalesContractDataTable'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'
import { useDebounce } from '@/hooks/useDebounce'

const MySalesContractPage = () => {
  const dispatch = useDispatch()
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const fullName = authUserWithRoleHasPermissions?.fullName
  const contracts = useSelector((state) => state.salesContract.contracts)
  const loading = useSelector((state) => state.salesContract.loading)
  const current = new Date()

  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  const pagination = useSelector((state) => state.salesContract.pagination)

  const [pageParams, setPageParams] = useState({
    page: 1,
    limit: 20
  })

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    document.title = `Hợp đồng bán hàng - ${fullName}`
    dispatch(getMySalesContracts({ ...filters, ...pageParams, search: debouncedSearch }))
  }, [dispatch, filters, fullName, pageParams, debouncedSearch])

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
              Danh sách hợp đồng bán hàng: {fullName}
            </h2>
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
            <SalesContractDataTable
              data={contracts}
              columns={columns}
              loading={loading}
              pagination={pagination}
              onPageChange={(page) => setPageParams(prev => ({ ...prev, page }))}
              onPageSizeChange={(limit) => setPageParams(prev => ({ ...prev, limit, page: 1 }))}
              onSearchChange={(value) => {
                setSearch(value)
              }}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MySalesContractPage
