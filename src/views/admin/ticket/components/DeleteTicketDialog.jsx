import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteTicket } from '@/stores/TicketSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'

const DeleteTicketDialog = ({ ticket, showTrigger = true, ...props }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.ticket.loading)

  const destroy = async (id) => {
    try {
      await dispatch(deleteTicket(id)).unwrap()
    } catch (error) {
      console.log('Xóa phiếu hỗ trợ lỗi: ', error)
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn chắc chắn muốn xóa phiếu hỗ trợ này?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Phiếu hỗ trợ{' '}
            <strong>
              #{ticket.id} - {ticket.subject}
            </strong>{' '}
            sẽ bị xóa khỏi hệ thống.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => destroy(ticket.id)}
              loading={loading}
            >
              Tiếp tục
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTicketDialog
