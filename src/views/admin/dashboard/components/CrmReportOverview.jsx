import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getTicketStats,
  getTicketSlaStats,
  getCareActivityStats,
  getTaskStats,
} from '@/stores/CrmReportSlice'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Ticket as TicketIcon,
  Clock,
  Activity,
  AlertTriangle,
  User as UserIcon,
  ListChecks,
} from 'lucide-react'
import { getUsers } from '@/stores/UserSlice'
import { getCustomers } from '@/stores/CustomerSlice'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'

// Helper: format phút -> "x giờ y phút"
const formatMinutes = (minutes) => {
  if (!minutes || minutes <= 0) return '0 phút'
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  if (!hours) return `${mins} phút`
  return `${hours} giờ ${mins} phút`
}

const ticketStatusLabels = {
  open: 'Mở',
  in_progress: 'Đang xử lý',
  pending: 'Đang chờ',
  resolved: 'Đã xử lý',
  closed: 'Đã đóng',
}

const taskStatusLabels = {
  open: 'Mở',
  in_progress: 'Đang xử lý',
  done: 'Hoàn thành',
  cancelled: 'Hủy',
}

const channelLabels = {
  phone: 'Điện thoại',
  email: 'Email',
  chat: 'Chat',
  zalo: 'Zalo',
  facebook: 'Facebook',
}

// màu theo status (badge)
const ticketStatusBadgeClass = {
  open: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-zinc-100 text-zinc-700 border-zinc-200',
}

const taskStatusBadgeClass = {
  open: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

// màu cho chart ticket status
const TICKET_STATUS_COLORS = {
  open: '#3b82f6', // blue-500
  in_progress: '#f97316', // orange-500
  pending: '#6b7280', // gray-500
  resolved: '#22c55e', // green-500
  closed: '#4b5563', // gray-600
}

// màu cho chart channel
const CHANNEL_COLORS = {
  phone: '#10b981', // emerald-500
  email: '#6366f1', // indigo-500
  chat: '#06b6d4', // cyan-500
  zalo: '#0ea5e9', // sky-500
  facebook: '#3b82f6', // blue-500
  default: '#a855f7', // purple-500
}

// màu cho chart task status
const TASK_STATUS_COLORS = {
  open: '#3b82f6',
  in_progress: '#f97316',
  completed: '#22c55e',
  cancelled: '#ef4444',
}

// Gom hoạt động theo khách hàng / nhân viên
const buildCareRows = (stats) => {
  const {
    mode,
    ticketByCustomer = [],
    noteByCustomer = [],
    taskByCustomer = [],
    ticketByUser = [],
    noteByUser = [],
    taskByUser = [],
  } = stats || {}

  if (mode === 'user') {
    const map = {}

    ticketByUser.forEach((i) => {
      if (!map[i.userId]) {
        map[i.userId] = { userId: i.userId, ticket: 0, note: 0, task: 0 }
      }
      map[i.userId].ticket = i.count
    })
    noteByUser.forEach((i) => {
      if (!map[i.userId]) {
        map[i.userId] = { userId: i.userId, ticket: 0, note: 0, task: 0 }
      }
      map[i.userId].note = i.count
    })
    taskByUser.forEach((i) => {
      if (!map[i.userId]) {
        map[i.userId] = { userId: i.userId, ticket: 0, note: 0, task: 0 }
      }
      map[i.userId].task = i.count
    })

    return {
      mode,
      rows: Object.values(map),
    }
  }

  // mode = customer (default)
  const map = {}

  ticketByCustomer.forEach((i) => {
    if (!map[i.customerId]) {
      map[i.customerId] = {
        customerId: i.customerId,
        ticket: 0,
        note: 0,
        task: 0,
      }
    }
    map[i.customerId].ticket = i.count
  })
  noteByCustomer.forEach((i) => {
    if (!map[i.customerId]) {
      map[i.customerId] = {
        customerId: i.customerId,
        ticket: 0,
        note: 0,
        task: 0,
      }
    }
    map[i.customerId].note = i.count
  })
  taskByCustomer.forEach((i) => {
    if (!map[i.customerId]) {
      map[i.customerId] = {
        customerId: i.customerId,
        ticket: 0,
        note: 0,
        task: 0,
      }
    }
    map[i.customerId].task = i.count
  })

  return {
    mode: 'customer',
    rows: Object.values(map),
  }
}

const CrmReportOverview = () => {
  const dispatch = useDispatch()

  const {
    ticketStats,
    ticketSlaStats,
    careActivityStats,
    taskStats,
    loadingTicketStats,
    loadingTicketSlaStats,
    loadingCareActivityStats,
    loadingTaskStats,
  } = useSelector((state) => state.crmReport)

  const users = useSelector((state) => state.user.users || [])
  const customers = useSelector((state) => state.customer.customers || [])

  useEffect(() => {
    dispatch(getTicketStats({}))
    dispatch(getTicketSlaStats({}))
    dispatch(getCareActivityStats({}))
    dispatch(getTaskStats({}))
    dispatch(getUsers())
    dispatch(getCustomers())
  }, [dispatch])

  const careRows = useMemo(
    () => buildCareRows(careActivityStats),
    [careActivityStats],
  )

  const findUserName = (id) =>
    users.find((u) => u.id === id)?.fullName || `User #${id}`

  const findCustomerName = (id) =>
    customers.find((c) => c.id === id)?.name || `KH #${id}`

  // Data cho chart
  const ticketStatusChartData = (ticketStats.byStatus || []).map((item) => ({
    status: ticketStatusLabels[item.status] || item.status,
    rawStatus: item.status,
    count: Number(item.count) || 0,
  }))

  const ticketChannelChartData = (ticketStats.byChannel || []).map((item) => ({
    channel: channelLabels[item.channel] || item.channel,
    rawChannel: item.channel,
    count: Number(item.count) || 0,
  }))

  const taskStatusChartData = (taskStats.byStatus || []).map((item) => ({
    status: taskStatusLabels[item.status] || item.status,
    rawStatus: item.status,
    count: Number(item.count) || 0,
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* --- Ticket by status & channel (có biểu đồ) --- */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <TicketIcon className="h-4 w-4" />
            Phiếu hỗ trợ KH theo trạng thái & kênh
          </CardTitle>
          {loadingTicketStats && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bar chart: ticket theo trạng thái */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Phiếu hỗ trợ KH theo trạng thái
              </span>
            </div>
            {ticketStatusChartData.length ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ticketStatusChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [`${value} ticket`, 'Số lượng']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {ticketStatusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            TICKET_STATUS_COLORS[entry.rawStatus] || '#64748b' // slate-500
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Chưa có dữ liệu phiếu hỗ trợ theo trạng thái.
              </div>
            )}

            {/* legend nhỏ có màu */}
            {ticketStatusChartData.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {ticketStatusChartData.map((item) => (
                  <div
                    key={item.rawStatus}
                    className="flex items-center gap-1 text-[11px]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          TICKET_STATUS_COLORS[item.rawStatus] || '#64748b',
                      }}
                    />
                    <span>{item.status}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({item.count})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pie chart: ticket theo kênh */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Phiếu hỗ trợ KH theo kênh tiếp nhận
            </span>
            {ticketChannelChartData.length ? (
              <div className="flex items-center gap-4">
                <div className="h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ticketChannelChartData}
                        dataKey="count"
                        nameKey="channel"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={35}
                        paddingAngle={3}
                      >
                        {ticketChannelChartData.map((entry, index) => {
                          const color =
                            CHANNEL_COLORS[entry.rawChannel] ||
                            CHANNEL_COLORS.default
                          return <Cell key={`cell-${index}`} fill={color} />
                        })}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} phiếu`,
                          props.payload.channel,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-1 flex-col gap-1 text-xs">
                  {ticketChannelChartData.map((item) => {
                    const color =
                      CHANNEL_COLORS[item.rawChannel] || CHANNEL_COLORS.default
                    return (
                      <div
                        key={item.rawChannel}
                        className="flex items-center justify-between rounded-md border px-2 py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span>{item.channel}</span>
                        </div>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Chưa có dữ liệu phiếu hỗ trợ theo kênh.
              </div>
            )}
          </div>

          {/* By assignee: list đẹp hơn, có màu nhấn số lượng */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Theo nhân viên phụ trách
            </span>
            {ticketStats.byAssignee?.length ? (
              <div className="space-y-1.5 text-sm">
                {ticketStats.byAssignee.map((item) => (
                  <div
                    key={item.assignedToUserId}
                    className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{findUserName(item.assignedToUserId)}</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {item.count} phiếu
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Chưa có dữ liệu theo nhân viên.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Ticket SLA: stat cards --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Thời gian hỗ trợ trung bình
          </CardTitle>
          {loadingTicketSlaStats && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <div className="text-xs text-muted-foreground">
              Tổng số ticket trong kỳ
            </div>
            <div className="text-2xl font-bold">{ticketSlaStats.count}</div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <div className="text-xs text-muted-foreground">Thời gian TB</div>
              <div className="mt-1 font-semibold">
                {formatMinutes(ticketSlaStats.avgMinutes)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <div className="text-xs text-muted-foreground">Nhanh nhất</div>
              <div className="mt-1 font-semibold">
                {formatMinutes(ticketSlaStats.minMinutes)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <div className="text-xs text-muted-foreground">Chậm nhất</div>
              <div className="mt-1 font-semibold">
                {formatMinutes(ticketSlaStats.maxMinutes)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Task stats + chart --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4" />
            Nhiệm vụ chăm sóc
          </CardTitle>
          {loadingTaskStats && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Chart trạng thái task */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Task theo trạng thái
            </span>
            {taskStatusChartData.length ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskStatusChartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [`${value} task`, 'Số lượng']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {taskStatusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            TASK_STATUS_COLORS[entry.rawStatus] || '#64748b'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Chưa có dữ liệu nhiệm vụ theo trạng thái.
              </div>
            )}

            {/* Legend + badge màu */}
            {taskStats.byStatus?.length ? (
              <div className="flex flex-wrap gap-2">
                {taskStats.byStatus.map((item) => {
                  const cls =
                    taskStatusBadgeClass[item.status] ||
                    'bg-slate-100 text-slate-700 border-slate-200'
                  return (
                    <Badge
                      key={item.status}
                      className={`border ${cls} flex items-center gap-2`}
                    >
                      <span>
                        {taskStatusLabels[item.status] || item.status}
                      </span>
                      <span className="rounded bg-white/60 px-1.5 text-xs font-semibold">
                        {item.count}
                      </span>
                    </Badge>
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* Overdue / pending box */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded border bg-red-50 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-xs text-red-600">Quá hạn</div>
                <div className="text-base font-semibold text-red-700">
                  {taskStats.overdue}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded border bg-amber-50 px-3 py-2">
              <Activity className="h-4 w-4 text-amber-500" />
              <div>
                <div className="text-xs text-amber-700">Đang chờ / xử lý</div>
                <div className="text-base font-semibold text-amber-700">
                  {taskStats.pending}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Care activity --- */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Hoạt động chăm sóc
          </CardTitle>
          {loadingCareActivityStats && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Chế độ hiển thị theo:{' '}
              <span className="font-medium text-foreground">
                {careRows.mode === 'customer' ? 'Khách hàng' : 'Nhân viên'}
              </span>
            </div>
          </div>

          {careRows.rows.length === 0 ? (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Chưa có dữ liệu hoạt động chăm sóc.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead className="border-b bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 font-semibold">
                      {careRows.mode === 'customer'
                        ? 'Khách hàng'
                        : 'Nhân viên'}
                    </th>
                    <th className="px-3 py-2 font-semibold">Phiếu hỗ trợ</th>
                    <th className="px-3 py-2 font-semibold">Ghi chú</th>
                    <th className="px-3 py-2 font-semibold">Nhiệm vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {careRows.rows.map((row, idx) => (
                    <tr
                      key={
                        careRows.mode === 'customer'
                          ? row.customerId
                          : row.userId
                      }
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/30'}
                    >
                      <td className="px-3 py-1.5">
                        {careRows.mode === 'customer'
                          ? findCustomerName(row.customerId)
                          : findUserName(row.userId)}
                      </td>
                      <td className="px-3 py-1.5">
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-[11px] text-blue-700"
                        >
                          {row.ticket || 0}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5">
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-[11px] text-amber-700"
                        >
                          {row.note || 0}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5">
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700"
                        >
                          {row.task || 0}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CrmReportOverview
