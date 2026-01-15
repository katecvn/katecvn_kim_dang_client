import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { TaskDataTable } from './components/TaskDataTable'
import { getTasks } from '@/stores/TaskSlice'
import { columns } from './components/Column'

const TaskPage = () => {
  const dispatch = useDispatch()
  const tasks = useSelector((state) => state.task.tasks)
  const loading = useSelector((state) => state.task.loading)
  const pagination = useSelector((state) => state.task.pagination)

  useEffect(() => {
    document.title = 'Quản lý nhiệm vụ'
    dispatch(getTasks({ page: 1, limit: pagination.limit || 10 }))
  }, [dispatch])

  const handlePageChange = (newPage) => {
    dispatch(getTasks({ page: newPage, limit: pagination.limit }))
  }

  const handlePageSizeChange = (newSize) => {
    dispatch(getTasks({ page: 1, limit: newSize }))
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách nhiệm vụ
            </h2>
          </div>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <TaskDataTable
            columns={columns}
            data={tasks}
            loading={loading}
            page={pagination.page}
            pageSize={pagination.limit}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default TaskPage
