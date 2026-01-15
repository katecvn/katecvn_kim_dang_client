import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { updateTicketStatus } from '@/stores/TicketSlice'
import { ticketStatuses } from '../data'

const TicketStatusCell = ({ ticket }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.ticket.loading)

  const [open, setOpen] = useState(false)
  const [statusValue, setStatusValue] = useState(ticket.status)

  const currentStatus = useMemo(
    () => ticketStatuses.find((item) => item.value === ticket.status),
    [ticket.status],
  )

  const selectedStatus = useMemo(
    () => ticketStatuses.find((item) => item.value === statusValue),
    [statusValue],
  )

  const handleSave = async () => {
    if (!statusValue || statusValue === ticket.status) {
      setOpen(false)
      return
    }

    try {
      await dispatch(
        updateTicketStatus({ id: ticket.id, status: statusValue }),
      ).unwrap()
      setOpen(false)
    } catch (error) {
      console.error('Cập nhật trạng thái lỗi: ', error)
    }
  }

  const renderBadge = (statusObj) => {
    if (!statusObj) {
      return (
        <span className="text-xs italic text-muted-foreground">Không rõ</span>
      )
    }

    const Icon = statusObj.icon

    return (
      <Badge
        variant={statusObj.variant || 'outline'}
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {statusObj.label}
      </Badge>
    )
  }

  return (
    <>
      <div className="flex w-[140px] items-center">
        {renderBadge(currentStatus)}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái phiếu hỗ trợ</DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái xử lý của phiếu hỗ trợ này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="text-sm">
              <div className="text-xs font-medium text-muted-foreground">
                Phiếu
              </div>
              <div className="font-medium">
                #{ticket.id} – {ticket.subject}
              </div>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Trạng thái mới</span>
              <Select
                value={statusValue}
                onValueChange={(value) => setStatusValue(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  {ticketStatuses.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStatus && (
              <div className="text-xs text-muted-foreground">
                {selectedStatus.description ||
                  'Chọn trạng thái phù hợp với tiến độ xử lý hiện tại.'}
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="default"
              onClick={handleSave}
              loading={loading}
            >
              Lưu trạng thái
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TicketStatusCell
