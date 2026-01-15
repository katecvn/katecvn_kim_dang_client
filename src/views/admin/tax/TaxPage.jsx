import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TaxDataTable } from './components/TaxDataTable'
import { getTaxes } from '@/stores/TaxSlice'
import { columns } from './components/Column'

const TaxPage = () => {
  const dispatch = useDispatch()
  const taxes = useSelector((state) => state.tax.taxes)
  const loading = useSelector((state) => state.tax.loading)

  useEffect(() => {
    document.title = 'Quản lý thuế'
    dispatch(getTaxes())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách các loại thuế
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {taxes && (
            <TaxDataTable data={taxes} columns={columns} loading={loading} />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default TaxPage
