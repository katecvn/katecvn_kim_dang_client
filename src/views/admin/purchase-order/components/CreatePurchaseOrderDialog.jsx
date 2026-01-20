import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { toast } from 'sonner'

const CreatePurchaseOrderDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn đặt hàng mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Form tạo đơn đặt hàng sẽ được implement sau.
            Cần có form chọn nhà cung cấp, thêm sản phẩm, số lượng, giá, v.v.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={() => {
              toast.info('Chức năng đang được phát triển')
              onOpenChange(false)
            }}>
              Tạo đơn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePurchaseOrderDialog
