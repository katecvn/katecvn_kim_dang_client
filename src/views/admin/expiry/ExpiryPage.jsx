import { Layout, LayoutBody } from '@/components/custom/Layout'
import ExpiryDataTable from './components/ExpiryDataTable'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { columns } from './components/Column'
import { getExpiry } from '@/stores/ExpirySlice'

const ExpiryPage = () => {
  const expiries = useSelector((state) => state.expiry.expiries)
  const loading = useSelector((state) => state.expiry.loading)

  const dispatch = useDispatch()
  useEffect(() => {
    document.title = 'Quản lý hạn dùng'
    dispatch(getExpiry())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách hạn dùng
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {expiries && (
            <ExpiryDataTable
              data={expiries}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default ExpiryPage
