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
import { deleteTask } from '@/stores/TaskSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'

const DeleteTaskDialog = ({ task, showTrigger = true, ...props }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.task.loading)

  const destroy = async (id) => {
    try {
      await dispatch(deleteTask({ id })).unwrap()
    } catch (error) {
      console.log('Xóa nhiệm vụ lỗi: ', error)
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
          <DialogTitle>Bạn chắc chắn muốn xóa nhiệm vụ này?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Nhiệm vụ{' '}
            <strong>
              #{task.id} - {task.subject}
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
              onClick={() => destroy(task.id)}
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

export default DeleteTaskDialog
