import { Layout, LayoutBody } from '@/components/custom/Layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { dateFormat } from '@/utils/date-format'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSystemLogs } from '@/stores/SystemLogSlice'
import Pagination from '@/components/custom/Pagination'

const SystemLogPage = () => {
  const dispatch = useDispatch()
  const { logs, loading, meta } = useSelector((state) => state.systemLog)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    document.title = 'Nhật ký hệ thống - CRM'
    dispatch(getSystemLogs({ page: currentPage }))
  }, [dispatch, currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col space-y-4" fixedHeight>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Nhật ký hệ thống
          </h2>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">STT</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-center">
                      {(currentPage - 1) * (meta.per_page || 15) + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.user?.fullName || log.username || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action || 'Info'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate" title={log.description}>
                      {log.description}
                    </TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>{dateFormat(log.createdAt, true)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Chưa có nhật ký nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex justify-end pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.last_page}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </LayoutBody>
    </Layout>
  )
}

export default SystemLogPage
