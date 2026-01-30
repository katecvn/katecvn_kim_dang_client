import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { useDispatch } from 'react-redux'
import { deletePurchaseContract } from '@/stores/PurchaseContractSlice'
import { useState } from 'react'

const DeletePurchaseContractDialog = ({ open, onOpenChange, contractId }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await dispatch(deletePurchaseContract(contractId)).unwrap()
      onOpenChange(false)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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

export default DeletePurchaseContractDialog
