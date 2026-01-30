import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/custom/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import { exportDomToImage } from '@/utils/exportToImage'
import ExportPurchaseContract from './ExportPurchaseContract'
import html2pdf from 'html2pdf.js'
import ReactDOM from 'react-dom/client'

const safe = (v, fallback = '') => (v === 0 || v ? String(v) : fallback)

export default function PurchaseContractPreviewDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
  contentClassName,
  overlayClassName,
  ...props
}) {
  const [formData, setFormData] = useState(initialData || {})
  const [isExporting, setIsExporting] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Reuse logic from ExportAgreementPdfV2's cleaner part if we want to extract it, 
  // but here we can just implement a simple pdf export or image export.
  // The User request mentions "click In hợp đồng" (Print Contract), so PDF is standard.

  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      const filename = `hop_dong_mua_ban_${Date.now()}.pdf`

      // We render a hidden version to export to PDF to ensure A4 sizing context
      const container = document.createElement('div')
      Object.assign(container.style, {
        position: 'fixed',
        left: '-10000px',
        top: '0',
        width: '210mm',
        background: '#fff',
        zIndex: '-1',
      })
      document.body.appendChild(container)

      const root = ReactDOM.createRoot(container)
      root.render(
        <div style={{ width: '210mm' }}>
          <ExportPurchaseContract data={formData} />
        </div>
      )

      // Wait for render
      await new Promise((r) => setTimeout(r, 500))

      const options = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      await html2pdf().set(options).from(container).save()

      root.unmount()
      document.body.removeChild(container)

      if (onConfirm) onConfirm()

    } catch (error) {
      console.error(error)
      alert('Xuất thất bại: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  if (!formData) return null

  const handleChange = (path, value) => {
    setFormData((prev) => {
      const clone = structuredClone(prev ?? {})
      let cur = clone
      const keys = path.split('.')
      keys.forEach((k, idx) => {
        if (idx === keys.length - 1) {
          cur[k] = value
        } else {
          cur[k] = cur[k] || {}
          cur = cur[k]
        }
      })
      return clone
    })
  }

  // Edit Form Fields
  const formFieldsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Thông tin hợp đồng</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Số hợp đồng
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.contract?.no)}
              onChange={(e) => handleChange('contract.no', e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium">
            Tiêu đề
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.contract?.title)}
              onChange={(e) => handleChange('contract.title', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Thông tin nhà cung cấp</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Tên nhà cung cấp
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.supplier?.name)}
              onChange={(e) => handleChange('supplier.name', e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium">
            Địa chỉ
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.supplier?.address)}
              onChange={(e) => handleChange('supplier.address', e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium">
            Điện thoại
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.supplier?.phone)}
              onChange={(e) => handleChange('supplier.phone', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Điều khoản khác</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Ghi chú chung
            <Textarea
              className="mt-1 h-20 text-xs"
              value={safe(formData.note)}
              onChange={(e) => handleChange('note', e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  )

  // Message only since preview is large
  const previewContent = (
    <div className="flex-1 overflow-auto rounded border bg-muted/40 p-2">
      <div className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
        <span>Xem trước</span>
      </div>
      <div className="overflow-auto border bg-white flex justify-center">
        <div style={{ transform: 'scale(0.65)', transformOrigin: 'top center' }}>
          <ExportPurchaseContract data={formData} />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          isMobile
            ? "max-w-full w-full h-screen inset-0 p-0 m-0 rounded-none flex flex-col"
            : "max-w-[90vw] h-[90vh] flex flex-col",
          contentClassName
        )}
        overlayClassName={overlayClassName}
        {...props}
      >
        <DialogHeader>
          <DialogTitle>Xem trước & chỉnh sửa hợp đồng mua hàng</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
          <div className="w-[350px] overflow-y-auto pr-2 shrink-0 border-r">
            {formFieldsContent}
          </div>
          {previewContent}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Đóng
          </Button>
          <Button onClick={handleExportPdf} disabled={isExporting}>
            {isExporting ? 'Đang xuất PDF...' : 'Xuất PDF & Hoàn tất'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
