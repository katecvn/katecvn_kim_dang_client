import { Layout, LayoutBody } from '@/components/custom/Layout'
import { ProductDataTable } from './components/ProductDataTable'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { useEffect } from 'react'
import { columns } from './components/Column'

const ProductPage = () => {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  const loading = useSelector((state) => state.product.loading)

  useEffect(() => {
    document.title = 'Quản lý sản phẩm'
    dispatch(getProducts())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách sản phẩm
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {products && (
            <ProductDataTable
              data={products}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default ProductPage
