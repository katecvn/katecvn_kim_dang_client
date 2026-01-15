import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Ticket, User, Phone, FileText } from 'lucide-react'
import { getTaskById } from '@/stores/TaskSlice'
import { dateFormat } from '@/utils/date-format'
import { taskPriorities, taskStatuses } from '../data'

const safeParseJson = (value) => {
  if (!value) return null
  if (typeof value === 'object') return value
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const Card = ({ title, children, className = '' }) => (
  <div className={`rounded-xl border bg-card p-4 shadow-sm ${className}`}>
    <div className="mb-3 text-sm font-semibold">{title}</div>
    {children}
  </div>
)

const Label = ({ children }) => (
  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
    {children}
  </div>
)

const Value = ({ children, className = '' }) => (
  <div className={`mt-1 text-sm ${className}`}>{children}</div>
)

const MetaRow = ({ label, value }) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <Value>{value || <span className="text-muted-foreground">—</span>}</Value>
  </div>
)

const TaskDetailDialog = ({ taskId, children }) => {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [task, setTask] = useState(null)
  const [taskMeta, setTaskMeta] = useState(null)
  const [ticketMeta, setTicketMeta] = useState(null)

  useEffect(() => {
    if (!open || !taskId) return

    const fetchDetail = async () => {
      setLoading(true)
      try {
        const data = await dispatch(getTaskById(taskId)).unwrap()
        setTask(data)
        setTaskMeta(safeParseJson(data.meta))
        setTicketMeta(safeParseJson(data.ticket?.meta))
      } catch (error) {
        console.error('Lấy chi tiết task thất bại:', error)
        setTask(null)
        setTaskMeta(null)
        setTicketMeta(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [open, taskId, dispatch])

  const priority = useMemo(
    () => (task ? taskPriorities.find((p) => p.value === task.priority) : null),
    [task],
  )

  const status = useMemo(
    () => (task ? taskStatuses.find((s) => s.value === task.status) : null),
    [task],
  )

  const customer = task?.customer
  const ticket = task?.ticket

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* Dialog to hơn, dễ đọc hơn */}
      <DialogContent className="max-h-[85vh] w-[95vw] max-w-5xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-lg">
            <span className="font-semibold">
              {task?.title || 'Chi tiết nhiệm vụ'}
            </span>
            {priority && (
              <Badge variant={priority.variant} className="text-xs">
                {priority.label}
              </Badge>
            )}
            {status && (
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Xem chi tiết nhiệm vụ và các thông tin liên quan đến khách hàng và
            phiếu hỗ trợ.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="mt-3 max-h-[calc(85vh-140px)] overflow-y-auto pr-1">
          {loading && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              Đang tải dữ liệu...
            </div>
          )}

          {!loading && !task && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Không tìm thấy dữ liệu nhiệm vụ.
            </div>
          )}

          {!loading && task && (
            <div className="space-y-4">
              {/* Hàng 1: Tổng quan */}
              <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Khách hàng">
                  {customer ? (
                    <div className="space-y-2">
                      <div className="text-base font-semibold">
                        {customer.code ? (
                          <span className="text-muted-foreground">
                            {customer.code} -{' '}
                          </span>
                        ) : null}
                        {customer.name}
                      </div>

                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Phone className="mt-0.5 h-4 w-4" />
                        <div className="whitespace-pre-line">
                          {customer.phone ||
                            customer.email ||
                            'Không có thông tin liên lạc'}
                        </div>
                      </div>

                      {customer.address ? (
                        <div className="whitespace-pre-line text-sm text-muted-foreground">
                          {customer.address}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">—</div>
                  )}
                </Card>

                <Card title="Phiếu hỗ trợ liên quan">
                  {ticket ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Ticket className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="text-base font-semibold">
                            #{ticket.id}
                          </div>
                          <div className="mt-0.5 whitespace-pre-line text-sm text-muted-foreground">
                            {ticket.subject}
                          </div>
                        </div>
                      </div>

                      {Array.isArray(ticketMeta?.tags) &&
                        ticketMeta.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ticketMeta.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[11px]"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Không liên kết phiếu hỗ trợ
                    </div>
                  )}
                </Card>

                <Card title="Phân công & Thời gian">
                  <div className="space-y-3">
                    <div>
                      <Label>Nhân viên phụ trách</Label>
                      <Value className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {task.assignedToUser?.fullName ? (
                          <span className="font-medium">
                            {task.assignedToUser.fullName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Chưa phân công
                          </span>
                        )}
                      </Value>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Hạn hoàn thành</Label>
                        <Value className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {task.dueDate
                              ? dateFormat(task.dueDate)
                              : 'Không đặt hạn'}
                          </span>
                        </Value>
                      </div>

                      <div>
                        <Label>Ngày tạo</Label>
                        <Value className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {task.createdAt ? dateFormat(task.createdAt) : '—'}
                          </span>
                        </Value>
                      </div>
                    </div>

                    {task.createdByUser?.fullName ? (
                      <div className="pt-1 text-xs text-muted-foreground">
                        Tạo bởi: {task.createdByUser.fullName}
                      </div>
                    ) : null}
                  </div>
                </Card>
              </div>

              {/* Hàng 2: Mô tả */}
              <Card title="Mô tả nhiệm vụ">
                <div className="whitespace-pre-line rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                  {task.description || (
                    <span className="text-muted-foreground">
                      Không có mô tả.
                    </span>
                  )}
                </div>
              </Card>

              {/* Hàng 3: Meta */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Thông tin bổ sung">
                  {taskMeta ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <MetaRow label="Kênh liên lạc" value={taskMeta.channel} />
                      <MetaRow
                        label="Người liên hệ"
                        value={taskMeta.contactPerson}
                      />
                      <MetaRow label="Số điện thoại" value={taskMeta.phone} />
                      <MetaRow
                        label="Hóa đơn liên quan"
                        value={taskMeta.relatedInvoiceId}
                      />

                      {Array.isArray(taskMeta.tags) &&
                        taskMeta.tags.length > 0 && (
                          <div className="space-y-1 sm:col-span-2">
                            <Label>Thẻ (tags)</Label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {taskMeta.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-[11px]"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Không có thông tin bổ sung.
                    </div>
                  )}
                </Card>

                <Card title="Ghi chú nội bộ (từ Ticket)">
                  {ticketMeta?.noteInternal ? (
                    <div className="whitespace-pre-line rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                      {ticketMeta.noteInternal}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Không có ghi chú nội bộ.
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetailDialog
