import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/custom/Button'
import { dateFormat } from '@/utils/date-format'
import { FileText, Image, Paperclip } from 'lucide-react'
import Can from '@/utils/can'

const safeParseJson = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const TicketMessagesTab = ({
  ticket,
  messages,
  loading,
  newMessage,
  setNewMessage,
  newMessageSender,
  setNewMessageSender,
  onSend,
}) => {
  return (
    <div className="space-y-3">
      <ScrollArea className="h-[420px] pr-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Đang tải trao đổi...
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const isStaff = !!msg.userId && msg.type !== 'system'
              const isCustomer = !!msg.customerId && msg.type !== 'system'
              const attachments = safeParseJson(msg.attachments)

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isStaff ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {isStaff ? 'NV' : isCustomer ? 'KH' : 'HT'}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`max-w-2xl space-y-2 ${isStaff ? '' : 'text-right'}`}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {isStaff
                          ? msg.user?.fullName ||
                            ticket.assignedToUser?.fullName ||
                            ticket.createdByUser?.fullName ||
                            'Nhân viên'
                          : isCustomer
                            ? ticket.customer?.name || 'Khách hàng'
                            : 'Hệ thống'}
                      </span>
                      <span>{dateFormat(msg.createdAt)}</span>
                    </div>

                    <div
                      className={`rounded-lg px-4 py-2 ${
                        msg.type === 'internal_note'
                          ? 'bg-amber-50 text-amber-900'
                          : isStaff
                            ? 'bg-primary text-primary-foreground'
                            : isCustomer
                              ? 'bg-muted'
                              : 'bg-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.message}</p>
                    </div>

                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            {String(att.name || '').match(
                              /\.(jpg|jpeg|png|gif)$/i,
                            ) ? (
                              <Image className="h-3 w-3" />
                            ) : (
                              <FileText className="h-3 w-3" />
                            )}
                            {att.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center text-muted-foreground">
              Chưa có trao đổi nào.
            </div>
          )}
        </div>
      </ScrollArea>

      <Can permission="CREATE_CUSTOMER_CARE">
        <div className="rounded-md border bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-3 text-xs">
            <span className="font-medium text-muted-foreground">
              Thêm trao đổi
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`rounded border px-2 py-0.5 text-[11px] ${
                  newMessageSender === 'staff'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
                onClick={() => setNewMessageSender('staff')}
              >
                Nhân viên
              </button>
              <button
                type="button"
                className={`rounded border px-2 py-0.5 text-[11px] ${
                  newMessageSender === 'customer'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
                onClick={() => setNewMessageSender('customer')}
              >
                Khách hàng
              </button>
            </div>
          </div>

          <Textarea
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập nội dung trao đổi..."
          />

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              size="sm"
              disabled={!newMessage.trim() || loading}
              onClick={onSend}
            >
              Lưu
            </Button>
          </div>
        </div>
      </Can>
    </div>
  )
}

export default TicketMessagesTab
