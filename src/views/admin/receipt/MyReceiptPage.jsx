import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getMyReceipts } from '@/stores/ReceiptSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ReceiptDataTable } from './components/ReceiptDataTable'
import { columns } from './components/Column'

const MyReceiptPage = () => {
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const fullName = authUserWithRoleHasPermissions?.fullName
  const dispatch = useDispatch()
  const receipts = useSelector((state) => state.receipt.receipts)
  const loading = useSelector((state) => state.receipt.loading)

  useEffect(() => {
    document.title = `Phiếu thu - ${fullName}`
    dispatch(getMyReceipts())
  }, [fullName, dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách phiếu thu: {fullName}
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {receipts && (
            <ReceiptDataTable
              data={receipts}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MyReceiptPage
