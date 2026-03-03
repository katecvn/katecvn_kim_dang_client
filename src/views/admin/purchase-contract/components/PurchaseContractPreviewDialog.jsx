import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import ExportPurchaseContract from './ExportPurchaseContract'
import { cn } from '@/lib/utils'

const safe = (v, fallback = '') => (v === 0 || v ? String(v) : fallback)

export default function PurchaseContractPreviewDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
  contentClassName,
  overlayClassName,
}) {
  const [formData, setFormData] = useState(initialData || {})
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    if (!initialData) {
      setFormData({})
      return
    }
    setFormData(initialData)
  }, [initialData])

  if (!formData) return null

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // ===== LEFT PANEL: Form fields =====
  const formFieldsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Thông tin hợp đồng</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Số hợp đồng
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.contract_no)}
              onChange={(e) => handleChange('contract_no', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Thông tin người bán (khách hàng)</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Họ và tên
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.customer_name)}
              onChange={(e) => handleChange('customer_name', e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium">
            Địa chỉ
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.customer_address)}
              onChange={(e) => handleChange('customer_address', e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium">
            CCCD
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.customer_id_number)}
              onChange={(e) => handleChange('customer_id_number', e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium">
            Điện thoại
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.customer_phone)}
              onChange={(e) => handleChange('customer_phone', e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium">
            Số tài khoản
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.customer_bank_account)}
              onChange={(e) => handleChange('customer_bank_account', e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium">
            Ngân hàng
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(formData.customer_bank_name)}
              onChange={(e) => handleChange('customer_bank_name', e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  )

  // ===== RIGHT PANEL: Preview =====
  const previewContent = (
    <div className="flex-1 overflow-auto rounded border bg-muted/40 p-2">
      <div className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
        <span>Xem trước</span>
        <span className="hidden md:inline">(Nội dung như khi xuất Word)</span>
      </div>
      <div className={isMobile
        ? 'overflow-x-auto overflow-y-auto border bg-white max-w-full'
        : 'overflow-auto border bg-white'
      }>
        <div style={isMobile ? {
          transform: 'scale(0.45)',
          transformOrigin: 'top left',
          minWidth: '210mm',
        } : {}}>
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
            ? 'max-w-full w-full h-[100dvh] inset-0 p-0 gap-0 flex flex-col top-0 left-0 right-0 m-0 rounded-none translate-x-0 translate-y-0 z-[10000]'
            : 'max-w-[80vw] gap-4',
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        {isMobile ? (
          <>
            <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b">
              <DialogTitle className="text-base">
                Xem trước & chỉnh sửa hợp đồng mua hàng
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="preview" className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-2 shrink-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
                  <TabsTrigger value="preview">Xem trước</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="edit" className="flex-1 overflow-y-auto px-4 mt-0 data-[state=inactive]:hidden">
                {formFieldsContent}
              </TabsContent>

              <TabsContent value="preview" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                <div className="h-full overflow-auto">
                  <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
                    <span>Xem trước</span>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto border-t bg-white">
                    <div style={{ transform: 'scale(0.45)', transformOrigin: 'top left', minWidth: '210mm' }}>
                      <ExportPurchaseContract data={formData} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="px-4 py-3 pb-12 shrink-0 flex flex-col gap-2 border-t bg-background">
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="flex-1">
                  Hủy
                </Button>
                <Button size="sm" onClick={() => onConfirm?.(formData)} className="flex-1">
                  Xác nhận & Xuất Word
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          /* Desktop: Side-by-side */
          <>
            <DialogHeader>
              <DialogTitle>Xem trước & chỉnh sửa hợp đồng mua hàng</DialogTitle>
            </DialogHeader>

            <div className="flex h-[80vh] gap-4 overflow-hidden">
              <div className="w-[30%] overflow-y-auto pr-2">
                {formFieldsContent}
              </div>
              {previewContent}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button size="sm" onClick={() => onConfirm?.(formData)}>
                Xác nhận & Xuất Word
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
