import { Badge } from '@/components/ui/badge'
import { dateFormat } from '@/utils/date-format'

const Field = ({ label, children, className = '' }) => (
  <div className={className}>
    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="mt-1 text-sm">{children}</div>
  </div>
)

const Card = ({ title, children }) => (
  <div className="rounded-xl border bg-card p-4 shadow-sm">
    <div className="mb-3 text-sm font-semibold">{title}</div>
    {children}
  </div>
)

const TicketInfoTab = ({ ticket, parsedMeta, metaTags, priority, channel }) => {
  const customerLine =
    ticket.customer?.phone ||
    ticket.customer?.email ||
    ticket.customer?.address ||
    ''

  const customerName = ticket.customer ? (
    <>
      {ticket.customer.code ? (
        <span className="text-muted-foreground">{ticket.customer.code} - </span>
      ) : null}
      <span className="font-medium">{ticket.customer.name}</span>
    </>
  ) : (
    <span className="text-muted-foreground">—</span>
  )

  return (
    <div className="space-y-4">
      {/* Header section: Customer + Status blocks */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Khách hàng">
          <div className="space-y-2">
            <div className="text-base">{customerName}</div>
            {customerLine ? (
              <div className="whitespace-pre-line text-sm text-muted-foreground">
                {customerLine}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </div>
        </Card>

        <Card title="Thông tin xử lý">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mức ưu tiên">
              {priority ? (
                <Badge
                  variant={priority.variant || 'outline'}
                  className="gap-1"
                >
                  {priority.icon ? <priority.icon className="h-4 w-4" /> : null}
                  {priority.label}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Không rõ</span>
              )}
            </Field>

            <Field label="Kênh tiếp nhận">
              {channel ? (
                <Badge variant={channel.variant || 'outline'} className="gap-1">
                  {channel.icon ? <channel.icon className="h-4 w-4" /> : null}
                  {channel.label}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Không rõ</span>
              )}
            </Field>

            <Field label="Nhân viên phụ trách" className="sm:col-span-2">
              {ticket.assignedToUser?.fullName ? (
                <span className="font-medium">
                  {ticket.assignedToUser.fullName}
                </span>
              ) : (
                <span className="text-muted-foreground">Chưa phân công</span>
              )}
            </Field>

            <Field label="Người tạo" className="sm:col-span-2">
              {ticket.createdByUser?.fullName || 'System'}
            </Field>
          </div>
        </Card>

        <Card title="Thời gian">
          <div className="grid gap-3">
            <Field label="Thời gian mở">
              {ticket.openedAt ? dateFormat(ticket.openedAt) : '—'}
            </Field>
            <Field label="Thời gian xử lý">
              {ticket.resolvedAt ? dateFormat(ticket.resolvedAt) : '—'}
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ngày tạo">
                {dateFormat(ticket.createdAt, true)}
              </Field>
              <Field label="Cập nhật">
                {dateFormat(ticket.updatedAt, true)}
              </Field>
            </div>
          </div>
        </Card>
      </div>

      {/* Content + Meta */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Nội dung phiếu hỗ trợ">
          <div className="whitespace-pre-line rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed">
            {ticket.description || '—'}
          </div>

          <div className="mt-4">
            <Field label="Hóa đơn liên quan">
              {ticket.invoiceId ? (
                <span className="font-medium">#{ticket.invoiceId}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
          </div>
        </Card>

        <Card title="Thông tin bổ sung">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nguồn tiếp nhận" className="sm:col-span-2">
              {parsedMeta?.source || (
                <span className="text-muted-foreground">Không rõ</span>
              )}
            </Field>

            <Field label="Liên hệ khách" className="sm:col-span-2">
              {parsedMeta?.customerContact || (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>

            <Field label="Phản hồi đầu tiên">
              {parsedMeta?.firstResponseAt
                ? dateFormat(parsedMeta.firstResponseAt)
                : '—'}
            </Field>

            <Field label="Thẻ (tags)">
              {metaTags ? (
                <span className="whitespace-pre-line">{metaTags}</span>
              ) : (
                <span className="text-muted-foreground">Chưa có thẻ</span>
              )}
            </Field>

            <div className="sm:col-span-2">
              <Field label="Ghi chú nội bộ">
                <div className="whitespace-pre-line rounded-lg border bg-amber-50 p-3 text-xs leading-relaxed">
                  {parsedMeta?.noteInternal || (
                    <span className="italic text-muted-foreground">
                      Chưa có ghi chú nội bộ
                    </span>
                  )}
                </div>
              </Field>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TicketInfoTab
