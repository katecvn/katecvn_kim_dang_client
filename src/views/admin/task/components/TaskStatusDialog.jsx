import { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/custom/Button'
import { taskStatuses } from '../data'
import { updateTaskStatus } from '@/stores/TaskSlice'

const TaskStatusDialog = ({ taskId, currentStatus, children }) => {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!taskId || !status) return
    setLoading(true)
    try {
      await dispatch(updateTaskStatus({ id: taskId, status })).unwrap()
      setOpen(false)
    } catch (error) {
      console.error('Cập nhật trạng thái thất bại:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái nhiệm vụ</DialogTitle>
          <DialogDescription>
            Chọn trạng thái mới cho nhiệm vụ này.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Trạng thái
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {taskStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !status}
            >
              {loading ? 'Đang lưu...' : 'Cập nhật'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskStatusDialog
