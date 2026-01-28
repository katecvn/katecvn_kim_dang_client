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

const UpdateReceiptStatusDialog = ({
  open,
  onOpenChange,
  receiptId,
  currentStatus,
  statuses = [],
  onSubmit, // Handler function to call on save
}) => {
  const current = useMemo(
    () => statuses.find((s) => s.value === currentStatus),
    [statuses, currentStatus],
  )

  const [status, setStatus] = useState(currentStatus || '')
  const [loading, setLoading] = useState(false)

  // Explicit color mapping since data might not have it
  const getColor = (statusValue) => {
    switch (statusValue) {
      case 'draft': return 'text-gray-600'
      case 'completed': return 'text-green-600'
      case 'canceled': return 'text-red-600'
      default: return ''
    }
  }

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
      // Allow re-saving if needed or strict check? Usually strict check.
      // But maybe user wants to trigger update for some reason. 
      // Let's keep consistent with invoice dialog
      toast.warning('Trạng thái mới trùng với trạng thái hiện tại')
      return
    }

    try {
      setLoading(true)
      await onSubmit?.(status, receiptId)
    } catch (error) {
      console.error(error)
      // Toast should be handled by the caller or slice
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái phiếu thu</DialogTitle>
          <DialogDescription>
            Phiếu thu: <span className="font-semibold">#{receiptId}</span>
            {current?.label ? (
              <>
                {' '}
                • Hiện tại:{' '}
                <span className={`font-semibold ${getColor(currentStatus)}`}>{current.label}</span>
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
                    className={`inline-flex items-center gap-2 font-medium ${getColor(status)}`}
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
                    className={`inline-flex items-center gap-2 font-medium ${getColor(s.value)}`}
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

export default UpdateReceiptStatusDialog
