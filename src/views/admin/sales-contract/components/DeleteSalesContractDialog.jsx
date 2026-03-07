import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { useDispatch } from 'react-redux'
import { deleteSalesContract } from '@/stores/SalesContractSlice'
import { useState } from 'react'

const DeleteSalesContractDialog = ({ open, onOpenChange, contractId, overlayClassName, contentClassName, onSuccess }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await dispatch(deleteSalesContract(contractId)).unwrap()
      if (onSuccess) {
        onSuccess()
      } else {
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa hợp đồng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteSalesContractDialog
