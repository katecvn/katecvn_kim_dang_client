import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/Button'
import { Trash2 } from 'lucide-react'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'

const TicketCustomerNotesTab = ({
  ticket,
  notes,
  loading,
  newNoteTitle,
  setNewNoteTitle,
  newNoteContent,
  setNewNoteContent,
  onCreate,
  onDelete,
}) => {
  return (
    <div className="space-y-3">
      <ScrollArea className="h-[350px] pr-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Đang tải ghi chú...
            </div>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border bg-card p-4 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-medium">{note.title || 'Ghi chú'}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {note.user?.fullName || 'Nhân viên'} •{' '}
                      {dateFormat(note.createdAt)}
                    </p>
                  </div>

                  {note.priority && (
                    <Badge
                      variant={
                        note.priority === 'high' ? 'destructive' : 'secondary'
                      }
                    >
                      {note.priority}
                    </Badge>
                  )}
                </div>

                <p className="mt-2 whitespace-pre-line text-muted-foreground">
                  {note.content}
                </p>

                {note.dueDate && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Hạn: {dateFormat(note.dueDate)}
                  </p>
                )}

                <Can permission="UPDATE_CUSTOMER_CARE">
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Cập nhật: {dateFormat(note.updatedAt)}</span>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Xóa
                    </button>
                  </div>
                </Can>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              Chưa có ghi chú nào cho khách hàng này.
            </div>
          )}
        </div>
      </ScrollArea>

      <Can permission="CREATE_CUSTOMER_CARE">
        {ticket?.customerId && (
          <div className="rounded-md border bg-muted/40 p-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Thêm ghi chú khách hàng
            </div>

            <Input
              className="mb-2"
              placeholder="Tiêu đề ghi chú"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
            />

            <Textarea
              rows={3}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Nội dung ghi chú..."
            />

            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                size="sm"
                disabled={!newNoteContent.trim() || loading}
                onClick={onCreate}
              >
                Lưu ghi chú
              </Button>
            </div>
          </div>
        )}
      </Can>
    </div>
  )
}

export default TicketCustomerNotesTab
