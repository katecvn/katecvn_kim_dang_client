import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSetting } from '@/stores/SettingSlice'
import { toast } from 'sonner'
import { downloadPublishedInvoice } from '@/api/s_invoice' // dùng hàm anh đã viết trước đó

const FILE_TYPES = [
  { value: 'PDF', label: 'File PDF' },
  { value: 'ZIP', label: 'ZIP (PDF + XML)' },
]

export default function DownloadEInvoiceDialog({
  open,
  onOpenChange,
  invoiceNo,
}) {
  const dispatch = useDispatch()
  const [fileType, setFileType] = useState('PDF')
  const [loading, setLoading] = useState(false)

  const setting = useSelector((state) => state.setting.setting)
  const settingLoading = useSelector((state) => state.setting.loading)

  useEffect(() => {
    if (open) {
      // lấy cấu hình s_invoice (trong đó có templateCode)
      dispatch(getSetting('s_invoice'))
    }
  }, [open, dispatch])

  const templateCode = setting?.payload.templateCode || null

  const handleDownload = async () => {
    if (!invoiceNo) {
      toast.error('Không tìm thấy số hóa đơn điện tử')
      return
    }

    try {
      setLoading(true)

      const dataToSend = {
        invoiceNo,
        templateCode, // BE sẽ tự dùng default nếu null
        fileType,
      }

      // id truyền vào để đặt tên file, anh có thể truyền invoiceNo luôn cho tiện
      await downloadPublishedInvoice(invoiceNo, dataToSend)

      toast.success('Đã tải hóa đơn điện tử')
      onOpenChange(false)
    } catch (error) {
      console.error('Download e-invoice error: ', error)
      toast.error('Tải hóa đơn điện tử thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải hóa đơn điện tử</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Mã hóa đơn điện tử</Label>
            <div className="rounded-md border bg-muted px-3 py-2 text-sm">
              {invoiceNo || '—'}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Loại file</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại file" />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Mẫu số (templateCode)</Label>
            <div className="rounded-md border bg-muted px-3 py-2 text-sm">
              {settingLoading
                ? 'Đang tải…'
                : templateCode || 'Dùng mẫu mặc định trong cấu hình Viettel'}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            loading={loading || settingLoading}
          >
            Tải hóa đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
