import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import provinces from '@/utils/province'
import Can from '@/utils/can'
import { useDispatch, useSelector } from 'react-redux'
import { syncSchools } from '@/stores/SchoolSlice'
import { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import CreateSchoolDialog from './CreateSchoolDialog'
import { getUsers } from '@/stores/UserSlice'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const provinceOptions = provinces.map((province) => ({
    value: province.id,
    label: province.name,
  }))

  const dispatch = useDispatch()
  const loading = useSelector((state) => state.school.loading)

  const handleRefreshSchool = async () => {
    try {
      dispatch(syncSchools()).unwrap()
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  const users = useSelector((state) => state.user.users)
  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  const [showCreateSchoolDialog, setShowCreateSchoolDialog] = useState(false)

  return (
    <>
      {showCreateSchoolDialog && (
        <CreateSchoolDialog
          open={showCreateSchoolDialog}
          onOpenChange={setShowCreateSchoolDialog}
          showTrigger={false}
        />
      )}

      <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Nhập tên, SĐT, chủ trường..."
            value={table.getState().globalFilter}
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            className="h-8 w-[150px] lg:w-[250px]"
          />

          <div className="flex gap-x-2">
            {table.getColumn('provinceId') && (
              <DataTableFacetedFilter
                column={table.getColumn('provinceId')}
                title="Tỉnh thành"
                options={provinceOptions}
              />
            )}
          </div>

          <div className="flex gap-x-2">
            {table.getColumn('plan') && (
              <DataTableFacetedFilter
                column={table.getColumn('plan')}
                title="Loại"
                options={[
                  {
                    value: 'demo',
                    label: 'Miễn phí',
                  },
                  {
                    value: 'paid',
                    label: 'Trả phí',
                  },
                ]}
              />
            )}
          </div>

          {users && (
            <div className="flex gap-x-2">
              {table.getColumn('user') && (
                <DataTableFacetedFilter
                  column={table.getColumn('user')}
                  title="Người phụ trách"
                  options={users?.map((user) => ({
                    value: user?.id,
                    label: user?.fullName,
                  }))}
                />
              )}
            </div>
          )}

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

        <Can permission={['GET_SCHOOL']}>
          <Button
            onClick={handleRefreshSchool}
            className="mx-2"
            variant="outline"
            size="sm"
            loading={loading}
          >
            {!loading && (
              <ReloadIcon className="mr-2 size-4" aria-hidden="true" />
            )}
            Làm mới
          </Button>
        </Can>

        <Can permission={['CREATE_SCHOOL']}>
          <Button
            onClick={() => setShowCreateSchoolDialog(true)}
            className="mx-2"
            variant="outline"
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
