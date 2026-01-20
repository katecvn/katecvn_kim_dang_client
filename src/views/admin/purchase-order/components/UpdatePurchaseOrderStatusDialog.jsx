import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const UpdatePurchaseOrderStatusDialog = ({
  open,
  onOpenChange,
  purchaseOrderId,
  currentStatus,
  statuses = [],
  onSubmit,
}) => {
  const current = useMemo(
    () => statuses.find((s) => s.value === currentStatus),
    [statuses, currentStatus],
  )

  const [status, setStatus] = useState(currentStatus || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setStatus(currentStatus || '')
  }, [open, currentStatus])

  const selectedStatusObj = useMemo(
    () => statuses.find((s) => s.value === status),
    [statuses, status],
  )

  const handleSave = async () => {
    if (!status) {
      toast.warning('Vui lòng chọn trạng thái')
      return
    }

    if (status === currentStatus) {
      toast.warning('Trạng thái mới trùng với trạng thái hiện tại')
      return
    }

    try {
      setLoading(true)
      await onSubmit?.(status, purchaseOrderId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn đặt hàng</DialogTitle>
          <DialogDescription>
            Đơn đặt hàng: <span className="font-semibold">#{purchaseOrderId}</span>
            {current?.label ? (
              <>
                {' '}
                • Hiện tại:{' '}
                <span className="font-semibold">{current.label}</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-sm font-medium">Trạng thái mới</div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái">
                {selectedStatusObj ? (
                  <span
                    className={`inline-flex items-center gap-2 font-medium ${selectedStatusObj.color || ''
                      }`}
                  >
                    {selectedStatusObj.icon ? (
                      <selectedStatusObj.icon className="h-4 w-4" />
                    ) : null}
                    {selectedStatusObj.label}
                  </span>
                ) : null}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              {statuses.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className="cursor-pointer"
                >
                  <span
                    className={`inline-flex items-center gap-2 font-medium ${s.color || ''
                      }`}
                  >
                    {s.icon ? <s.icon className="h-4 w-4" /> : null}
                    {s.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePurchaseOrderStatusDialog
