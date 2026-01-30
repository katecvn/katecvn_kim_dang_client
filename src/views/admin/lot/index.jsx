import { Layout, LayoutBody } from '@/components/custom/Layout'
import { LotDataTable } from './components/LotDataTable'
import { columns } from './components/Column'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getLots } from '@/stores/LotSlice'

export default function LotPage() {
  const dispatch = useDispatch()
  const { lots, loading } = useSelector((state) => state.lot)

  // Fetch data on mount
  // Note: Pagination handled within DataTable/Table state usually, but ProductPage fetches all.
  // Checking LotSlice again, getLots takes params. 
  // ProductPage: dispatch(getProducts()) -> fetches all?
  // If my getLots supports pagination text, I might need to clarify how ProductPage handles pagination.
  // ProductDataTable uses client-side pagination! (getPaginationRowModel).
  // I will switch to client-side pagination to match ProductPage pattern if ProductPage fetches all products.

  useEffect(() => {
    document.title = 'Quản lý lô hàng'
    dispatch(getLots())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2 px-2 sm:px-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Quản lý lô hàng
            </h2>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-2 sm:px-0">
          <LotDataTable
            data={lots || []}
            columns={columns}
            loading={loading}
          />
        </div>
      </LayoutBody>
    </Layout>
  )
}
