import { Layout, LayoutBody } from '@/components/custom/Layout'
import SchoolDataTable from './components/SchoolDataTable'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { columns } from './components/Column'
import { getSchoolsByUser } from '@/stores/SchoolSlice'

const MySchoolPage = () => {
  const schools = useSelector((state) => state.school.schools)
  const loading = useSelector((state) => state.school.loading)
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const fullName = authUserWithRoleHasPermissions?.fullName

  const dispatch = useDispatch()
  useEffect(() => {
    document.title = 'Quản lý trường'
    dispatch(getSchoolsByUser())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách trường học: {fullName}
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {schools && (
            <SchoolDataTable
              data={schools}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MySchoolPage
