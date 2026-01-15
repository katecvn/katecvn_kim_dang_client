import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getInvoices } from '@/stores/InvoiceSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import InvoiceDataTable from './components/InvoiceDataTable'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'

const InvoicePage = () => {
  const dispatch = useDispatch()
  const invoices = useSelector((state) => state.invoice.invoices)
  const loading = useSelector((state) => state.invoice.loading)
  const current = new Date()

  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  useEffect(() => {
    document.title = 'Danh sách hóa đơn'
    dispatch(getInvoices(filters))
  }, [dispatch, filters])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách hóa đơn
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
          {invoices && (
            <InvoiceDataTable
              data={invoices}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default InvoicePage
