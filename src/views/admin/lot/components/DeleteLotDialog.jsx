import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { useDispatch } from 'react-redux'
import { deleteLot, getLots } from '@/stores/LotSlice'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DeleteLotDialog({
  open,
  onOpenChange,
  lot,
  showTrigger = true,
  onSuccess,
}) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await dispatch(deleteLot(lot.id)).unwrap()
      toast.success('Xóa lô hàng thành công')
      onOpenChange(false)
      onSuccess?.()
      dispatch(getLots())
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi xóa lô hàng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Xóa lô hàng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa lô hàng <span className="font-bold">{lot?.code}</span> không?
            <br />
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteLotDialog
