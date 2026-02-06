import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import Can from '@/utils/can'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import CreateExpiryDialog from './CreateExpiryDialog'
import { getUsers } from '@/stores/UserSlice'
import { getExpiry } from '@/stores/ExpirySlice'
import { getProducts } from '@/stores/ProductSlice'

const DataTableToolbar = ({ table }) => {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)

  useEffect(() => {
    dispatch(getProducts()).unwrap()
  }, [dispatch])

  const isFiltered = table.getState().columnFilters.length > 0

  const loading = useSelector((state) => state.expiry.loading)

  const handleRefreshExpiry = async () => {
    try {
      dispatch(getExpiry({ page: 1, limit: 30 })).unwrap()
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  const users = useSelector((state) => state.user.users)
  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  const [showCreateExpiryDialog, setShowCreateExpiryDialog] = useState(false)

  return (
    <>
      {showCreateExpiryDialog && (
        <CreateExpiryDialog
          open={showCreateExpiryDialog}
          onOpenChange={setShowCreateExpiryDialog}
          showTrigger={false}
        />
      )}

      <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Nhập tên tài khoản...."
            value={table.getState().globalFilter}
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            className="h-8 w-[150px] lg:w-[250px]"
          />

          <div className="flex gap-x-2">
            {table.getColumn('product') && (
              <DataTableFacetedFilter
                column={table.getColumn('product')}
                title="Sản phẩm"
                options={products
                  ?.filter((product) => product.hasExpiry)
                  .map((product) => ({
                    value: product.id,
                    label: product.name,
                  }))}
              />
            )}

            {table.getColumn('userId') && (
              <DataTableFacetedFilter
                column={table.getColumn('userId')}
                title="Nhân viên"
                options={users?.map((user) => ({
                  value: user?.id,
                  label: user?.fullName,
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

        <Button
          onClick={handleRefreshExpiry}
          className="mx-2 hover:bg-primary hover:text-primary-foreground"
          variant="outline"
          size="sm"
          loading={loading}
        >
          {!loading && (
            <ReloadIcon className="mr-2 size-4" aria-hidden="true" />
          )}
          Làm mới
        </Button>

        <Can permission={['CREATE_EXPIRY']}>
          <Button
            onClick={() => setShowCreateExpiryDialog(true)}
            className="mx-2 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <IconPlus className="mr-2 size-4" /> Thêm mới
          </Button>
        </Can>

        <DataTableViewOptions table={table} />
      </div>
    </>
  )
}

export { DataTableToolbar }
