import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { TicketDataTable } from './components/TicketDataTable'
import { getTickets } from '@/stores/TicketSlice'
import { columns } from './components/Column'

const TicketPage = () => {
  const dispatch = useDispatch()
  const tickets = useSelector((state) => state.ticket.tickets)
  const loading = useSelector((state) => state.ticket.loading)
  const pagination = useSelector((state) => state.ticket.pagination)

  useEffect(() => {
    document.title = 'Quản lý ticket'
    dispatch(getTickets({ page: 1, limit: pagination.limit }))
  }, [dispatch])

  const handlePageChange = (newPage) => {
    dispatch(getTickets({ page: newPage, limit: pagination.limit }))
  }

  const handlePageSizeChange = (newSize) => {
    dispatch(getTickets({ page: 1, limit: newSize }))
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách phiếu hỗ trợ
            </h2>
          </div>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <TicketDataTable
            columns={columns}
            data={tickets}
            loading={loading}
            page={pagination.page}
            pageSize={pagination.limit}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default TicketPage
