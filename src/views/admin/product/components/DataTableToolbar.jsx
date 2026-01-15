import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import CreateProductDialog from './CreateProductDialog'
import Can from '@/utils/can'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconApiApp,
  IconCopyCheck,
  IconDeviceDesktopAnalytics,
} from '@tabler/icons-react'
import { getCategories } from '@/stores/CategorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { copyProduct, getProducts } from '@/stores/ProductSlice'
import { toast } from 'sonner'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false)
  const [productSource, setProductSource] = useState('')
  const dispatch = useDispatch()
  const categories = useSelector((state) => state.category.categories)
  const loading = useSelector((state) => state.product.loading)

  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch])

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('name')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex gap-x-2">
          {table.getColumn('categoryId') && (
            <DataTableFacetedFilter
              column={table.getColumn('categoryId')}
              title="Danh mục"
              options={categories.map((category) => ({
                value: parseInt(category?.id),
                label: category?.name,
              }))}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Đặt lại
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sao chép sản phẩm */}
      <Button
        className="mx-2"
        variant="outline"
        size="sm"
        onClick={async () => {
          const selectedRows = table.getSelectedRowModel().rows
          if (selectedRows.length !== 1) {
            toast.warning('Vui lòng chọn một sản phẩm để sao chép')
            return
          }

          const productId = selectedRows[0]?.original?.id
          try {
            await dispatch(copyProduct(productId)).unwrap()
            await dispatch(getProducts()).unwrap()
            return true
          } catch (error) {
            console.log(error)
          }
        }}
        loading={loading}
      >
        <IconCopyCheck className="mr-2 size-4" aria-hidden="true" />
        Sao chép
      </Button>

      <Can
        permission={[
          'CREATE_PRODUCT',
          'GET_SUPPLIER',
          'GET_CATEGORY',
          'GET_UNIT',
        ]}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="mx-2" variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Thêm mới
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              {/* Sản phẩm công ty */}
              <DropdownMenuItem
                onClick={() => {
                  setProductSource('company')
                  setShowCreateProductDialog(true)
                }}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <IconDeviceDesktopAnalytics className="me-2 h-4 w-4" />
                </div>
                <span className="ml-2">Sản phẩm/Dịch vụ công ty</span>
              </DropdownMenuItem>

              {/* Sản phẩm đối tác */}
              <DropdownMenuItem
                onClick={() => {
                  setProductSource('partner')
                  setShowCreateProductDialog(true)
                }}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <IconApiApp className="me-2 h-4 w-4" />
                </div>
                <span className="ml-2">Sản phẩm/Dịch vụ đối tác</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {showCreateProductDialog && (
          <CreateProductDialog
            open={showCreateProductDialog}
            onOpenChange={setShowCreateProductDialog}
            productSource={productSource}
            showTrigger={false}
          />
        )}
      </Can>

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
