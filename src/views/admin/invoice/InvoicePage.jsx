import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getInvoices } from '@/stores/InvoiceSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { columns } from './components/Column'
import InvoiceDataTable from './components/InvoiceDataTable'
import ViewInvoiceDialog from './components/ViewInvoiceDialog'
import InvoiceDialog from './components/InvoiceDialog'
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

  const [searchParams, setSearchParams] = useSearchParams()
  const [viewInvoiceId, setViewInvoiceId] = useState(null)
  const [updateInvoiceId, setUpdateInvoiceId] = useState(null)
  const [showUpdateInvoiceDialog, setShowUpdateInvoiceDialog] = useState(false)

  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  useEffect(() => {
    document.title = 'Danh sách đơn bán'
    dispatch(getInvoices(filters))
  }, [dispatch, filters])

  const handleInvoiceCreated = (newInvoice) => {
    if (newInvoice?.id) {
      setViewInvoiceId(newInvoice.id)
    }
  }

  // Handle ?view=invoiceId query parameter
  useEffect(() => {
    const viewParam = searchParams.get('view')
    if (viewParam) {
      const invoiceId = parseInt(viewParam, 10)
      if (!isNaN(invoiceId)) {
        setViewInvoiceId(invoiceId)
      }
    }
  }, [searchParams])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 -mx-4 px-1 flex flex-col sm:mx-0 sm:px-0 sm:flex-row sm:items-center justify-between gap-2">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách đơn bán
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
              }}
            />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-1 sm:px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {invoices && (
            <InvoiceDataTable
              data={invoices}
              columns={columns}
              loading={loading}
              onCreated={handleInvoiceCreated}
              onView={(id) => setViewInvoiceId(id)}
            />
          )}
        </div>

        {/* Auto-open ViewInvoiceDialog from QR code scan */}
        {viewInvoiceId && (
          <ViewInvoiceDialog
            open={!!viewInvoiceId}
            onOpenChange={(open) => {
              if (!open) {
                setViewInvoiceId(null)
                // Remove ?view param from URL
                searchParams.delete('view')
                setSearchParams(searchParams)
              }
            }}
            invoiceId={viewInvoiceId}
            showTrigger={false}
            onEdit={() => {
              setUpdateInvoiceId(viewInvoiceId)
              setViewInvoiceId(null)
              searchParams.delete('view')
              setSearchParams(searchParams)
              setTimeout(() => {
                setShowUpdateInvoiceDialog(true)
              }, 100)
            }}
          />
        )}

        {/* Update Invoice Dialog */}
        {showUpdateInvoiceDialog && updateInvoiceId && (
          <InvoiceDialog
            open={showUpdateInvoiceDialog}
            onOpenChange={setShowUpdateInvoiceDialog}
            invoiceId={updateInvoiceId}
            showTrigger={false}
          />
        )}
      </LayoutBody>
    </Layout>
  )
}

export default InvoicePage
