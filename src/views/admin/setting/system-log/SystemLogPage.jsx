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
import { SystemLogPagination } from './SystemLogPagination'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Eye, Plus, Edit3, Trash2, LogIn, LogOut } from 'lucide-react'
import { DateRange } from '@/components/custom/DateRange'
import { getUsers } from '@/stores/UserSlice'
import { format } from 'date-fns'
import LogDetailDialog from './LogDetailDialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const SystemLogPage = () => {
  const dispatch = useDispatch()
  const { logs, loading, meta } = useSelector((state) => state.systemLog)
  const { users } = useSelector((state) => state.user)

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    userId: 'all',
    action: 'all',
    entity: '',
    ipAddress: '',
    fromDate: undefined,
    toDate: undefined,
  })

  // Detail Dialog State
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Load initial data and users
  useEffect(() => {
    document.title = 'Nhật ký hệ thống - CRM'
    // Fetch users for filter
    if (!users || users.length === 0) {
      dispatch(getUsers())
    }
  }, [dispatch, users])

  // Fetch logs whenever filters change
  useEffect(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
      // Handle 'all' values
      userId: filters.userId !== 'all' ? filters.userId : undefined,
      action: filters.action !== 'all' ? filters.action : undefined,
      entity: filters.entity || undefined,
      ipAddress: filters.ipAddress || undefined,
      // Format dates to ISO/YYYY-MM-DD
      startDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      endDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
    }
    dispatch(getSystemLogs(params))
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 on filter change
    }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      userId: 'all',
      action: 'all',
      entity: '',
      ipAddress: '',
      fromDate: undefined,
      toDate: undefined,
    })
  }

  const openDetail = (log) => {
    setSelectedLog(log)
    setShowDetailDialog(true)
  }

  const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']

  const ACTIONS_CONFIG = {
    CREATE: {
      label: 'CREATE',
      icon: Plus,
      color: 'border-green-700 bg-transparent text-green-700',
    },
    UPDATE: {
      label: 'UPDATE',
      icon: Edit3,
      color: 'border-blue-700 bg-transparent text-blue-700',
    },
    DELETE: {
      label: 'DELETE',
      icon: Trash2,
      color: 'border-red-700 bg-transparent text-red-700',
    },
    LOGIN: {
      label: 'LOGIN',
      icon: LogIn,
      color: 'border-purple-700 bg-transparent text-purple-700',
    },
    LOGOUT: {
      label: 'LOGOUT',
      icon: LogOut,
      color: 'border-orange-700 bg-transparent text-orange-700',
    },
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col space-y-4" fixedHeight>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Nhật ký hệ thống
          </h2>
        </div>

        {/* Toolbar */}
        <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
          <div className="flex flex-1 items-center space-x-2">
            {/* User Select */}
            <Select
              value={filters.userId?.toString()}
              onValueChange={(val) => handleFilterChange('userId', val)}
            >
              <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
                <SelectValue placeholder="Người dùng" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả người dùng</SelectItem>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.fullName || u.username}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Action Select */}
            <Select
              value={filters.action}
              onValueChange={(val) => handleFilterChange('action', val)}
            >
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Hành động" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  {ACTIONS.map((act) => (
                    <SelectItem key={act} value={act}>
                      {act}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Entity Input */}
            <Input
              placeholder="Đối tượng..."
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
              className="h-8 w-[150px] lg:w-[200px]"
            />

            {/* IP Input */}
            <Input
              placeholder="IP Address..."
              value={filters.ipAddress}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
              className="h-8 w-[150px]"
            />

            {/* Date Range */}
            <div className="w-[250px]">
              <DateRange
                className="h-8"
                defaultValue={{ from: filters.fromDate, to: filters.toDate }}
                onChange={(range) => {
                  setFilters((prev) => ({
                    ...prev,
                    fromDate: range?.from,
                    toDate: range?.to,
                    page: 1,
                  }))
                }}
                align="start"
              />
            </div>

            {/* Reset Button */}
            {(filters.userId !== 'all' ||
              filters.action !== 'all' ||
              filters.entity ||
              filters.ipAddress ||
              filters.fromDate ||
              filters.toDate) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-8 px-2 lg:px-3"
                >
                  Đặt lại
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-secondary">
              <TableRow>
                <TableHead className="w-[50px] text-center">STT</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-center">
                      {(filters.page - 1) * (meta.per_page || filters.limit) + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.user?.fullName || log.username || 'System'}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const actionConfig = ACTIONS_CONFIG[log.action]
                        const IconComponent = actionConfig?.icon
                        return (
                          <Badge
                            variant="outline"
                            className={`${actionConfig?.color || 'border-gray-300 bg-gray-50 text-gray-700'}`}
                          >
                            {IconComponent && <IconComponent className="mr-2 h-4 w-4 inline" />}
                            {log.action}
                          </Badge>
                        )
                      })()}
                    </TableCell>
                    <TableCell>
                      <span className='font-medium'>{log.entityNameVi}</span>
                      {log.entityId && <span className='text-muted-foreground text-xs ml-1'>#{log.entityId}</span>}
                    </TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>{dateFormat(log.createdAt, true)}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openDetail(log)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem chi tiết thay đổi</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Chưa có nhật ký nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex justify-end pt-4">
            <SystemLogPagination
              currentPage={filters.page}
              totalPages={meta.last_page || 1}
              pageSize={filters.limit}
              totalItems={meta.total || 0}
              onPageChange={handlePageChange}
              onPageSizeChange={(val) => handleFilterChange('limit', val)}
            />
          </div>
        )}

        {/* Detail Dialog */}
        <LogDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          log={selectedLog}
        />
      </LayoutBody>
    </Layout>
  )
}

export default SystemLogPage
