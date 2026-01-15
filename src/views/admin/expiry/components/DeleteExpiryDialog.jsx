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
import { deleteAccount } from '@/stores/ExpirySlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'

const DeleteExpiryDialog = ({ accountData, showTrigger = true, ...props }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.expiry.loading)

  const destroy = async (id) => {
    try {
      await dispatch(deleteAccount(id)).unwrap()
    } catch (error) {
      console.error('Delete error: ', error)
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Xóa
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn chắc chắn muốn xóa?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Thông tin quản lý hạn:{' '}
            <strong>{accountData.accountName}</strong> sẽ bị xóa vĩnh viễn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => destroy(accountData.id)}
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

export { DeleteExpiryDialog }
