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
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const UpdateInvoiceStatusDialog = ({
  open,
  onOpenChange,
  invoiceId,
  currentStatus,
  paymentStatus,
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
      await onSubmit?.(status, invoiceId)
    } finally {
      setLoading(false)
    }
  }

  const isPaid = paymentStatus === 'paid'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái hóa đơn</DialogTitle>
          <DialogDescription>
            Hóa đơn: <span className="font-semibold">#{invoiceId}</span>
            {current?.label ? (
              <>
                {' '}
                • Hiện tại:{' '}
                <span className="font-semibold">{current.label}</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {isPaid ? (
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Không thể thay đổi trạng thái</AlertTitle>
              <AlertDescription>
                Hóa đơn này đã được thanh toán hoàn tất (Paid). Bạn không thể thay đổi trạng thái của hóa đơn này.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
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

              <SelectContent position="popper">
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
        )}


        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {isPaid ? 'Đóng' : 'Hủy'}
          </Button>
          {!isPaid && (
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          )}

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateInvoiceStatusDialog
