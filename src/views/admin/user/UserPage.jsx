import { Layout, LayoutBody } from '@/components/custom/Layout'
import { UserDataTable } from './components/UserDataTable'
import { columns } from './components/Column'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers } from '@/stores/UserSlice'

const UserPage = () => {
  const dispatch = useDispatch()
  const users = useSelector((state) => state.user.users)
  const loading = useSelector((state) => state.user.loading)

  useEffect(() => {
    document.title = 'Quản lý người dùng'
    dispatch(getUsers())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách người dùng
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {users && (
            <UserDataTable data={users} columns={columns} loading={loading} />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default UserPage
