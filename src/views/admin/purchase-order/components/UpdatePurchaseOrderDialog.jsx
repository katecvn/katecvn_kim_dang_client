import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { toast } from 'sonner'

const UpdatePurchaseOrderDialog = ({
  open,
  onOpenChange,
  purchaseOrderId,
  showTrigger = true,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật đơn đặt hàng #{purchaseOrderId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Form cập nhật đơn đặt hàng sẽ được implement sau.
            Cho phép chỉnh sửa thông tin đơn hàng khi status = pending.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={() => {
              toast.info('Chức năng đang được phát triển')
              onOpenChange(false)
            }}>
              Cập nhật
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePurchaseOrderDialog
