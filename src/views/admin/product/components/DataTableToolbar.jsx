import { Cross2Icon, PlusIcon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import CreateProductDialog from './CreateProductDialog'
import Can from '@/utils/can'
import { useEffect, useState } from 'react'
import { getCategories } from '@/stores/CategorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { copyProduct, getProducts } from '@/stores/ProductSlice'
import { toast } from 'sonner'
import { IconCopyCheck } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false)
  const dispatch = useDispatch()
  const categories = useSelector((state) => state.category.categories)
  const loading = useSelector((state) => state.product.loading)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch])

  // Mobile view - Search + Menu
  if (!isDesktop) {
    return (
      <div className="flex w-full items-center justify-between gap-2 p-1">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('name')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="h-8 flex-1 text-xs"
        />

        <Can
          permission={[
            'CREATE_PRODUCT',
            'GET_SUPPLIER',
            'GET_CATEGORY',
            'GET_UNIT',
          ]}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateProductDialog(true)}
            className="h-8 px-2"
          >
            <PlusIcon className="size-4" aria-hidden="true" />
          </Button>

          {showCreateProductDialog && (
            <CreateProductDialog
              open={showCreateProductDialog}
              onOpenChange={setShowCreateProductDialog}
              showTrigger={false}
            />
          )}
        </Can>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <HamburgerMenuIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              {/* Danh mục */}
              {table.getColumn('categoryId') && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium">Danh mục</div>
                  <DataTableFacetedFilter
                    column={table.getColumn('categoryId')}
                    title="Chọn danh mục"
                    options={categories.map((category) => ({
                      value: parseInt(category?.id),
                      label: category?.name,
                    }))}
                  />
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Sao chép sản phẩm */}
              <DropdownMenuItem
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
                    toast.success('Sao chép thành công')
                  } catch (error) {
                    toast.error('Lỗi sao chép')
                    console.log(error)
                  }
                }}
              >
                <IconCopyCheck className="mr-2 size-4" />
                <span>Sao chép</span>
              </DropdownMenuItem>

              {/* Reset filter */}
              {isFiltered && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => table.resetColumnFilters()}
                  >
                    <Cross2Icon className="mr-2 size-4" />
                    <span>Đặt lại bộ lọc</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Desktop view - Full toolbar
  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2 min-w-0">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('name')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex gap-x-2 flex-shrink-0">
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
            className="h-8 px-1 sm:px-2 lg:px-3 text-xs sm:text-sm"
          >
            Đặt lại
            <Cross2Icon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      {/* Sao chép sản phẩm */}
      <Button
        className="mx-0 sm:mx-2"
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
        <Button
          className="mx-2"
          variant="outline"
          size="sm"
          onClick={() => setShowCreateProductDialog(true)}
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        {showCreateProductDialog && (
          <CreateProductDialog
            open={showCreateProductDialog}
            onOpenChange={setShowCreateProductDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
