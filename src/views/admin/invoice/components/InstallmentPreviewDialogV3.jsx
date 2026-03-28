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
import ExportInstallmentV3 from './ExportInstallmentV3'
import { cn } from '@/lib/utils'
import { statuses } from '../../sales-contract/data'

const safe = (v, fallback = '') => (v === 0 || v ? String(v) : fallback)

export default function InstallmentPreviewDialogV3({
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

  const contract = formData.contract ?? {}
  const customer = formData.customer ?? {}
  const payment = formData.payment ?? {}
  const totals = formData.totals ?? {}

  const isEditable = formData.status === 'draft'
  const statusLabel = statuses.find(s => s.value === formData.status)?.label || formData.status

  const formFieldsContent = (
    <div className="space-y-4">
      {!isEditable && (
        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
          Hợp đồng đang ở trạng thái <strong>{statusLabel}</strong>, không thể chỉnh sửa.
        </div>
      )}
      <div className="flex items-center justify-between rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
        <span>Số lần in: <strong>{(formData.printCount || 0) + 1}</strong></span>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Thông tin hợp đồng</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Số hợp đồng
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(contract.no)}
              onChange={(e) => handleChange('contract.no', e.target.value)}
              disabled={!isEditable}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Thông tin khách hàng
        </h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Họ và tên
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.name)}
              onChange={(e) => handleChange('customer.name', e.target.value)}
              disabled={!isEditable}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-medium">
              Năm sinh
              <Input
                className="mt-1 h-8 text-xs"
                type="date"
                value={safe(customer.dateOfBirth)}
                onChange={(e) => handleChange('customer.dateOfBirth', e.target.value)}
                disabled={!isEditable}
              />
            </label>
            <label className="block text-xs font-medium">
              Điện thoại
              <Input
                className="mt-1 h-8 text-xs"
                value={safe(customer.phone)}
                onChange={(e) => handleChange('customer.phone', e.target.value)}
                disabled={!isEditable}
              />
            </label>
          </div>
          <label className="block text-xs font-medium">
            CCCD / Hộ chiếu
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.identityCard)}
              onChange={(e) => handleChange('customer.identityCard', e.target.value)}
              disabled={!isEditable}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-medium">
              Ngày cấp
              <Input
                className="mt-1 h-8 text-xs"
                type="date"
                value={safe(customer.identityDate)}
                onChange={(e) => handleChange('customer.identityDate', e.target.value)}
                disabled={!isEditable}
              />
            </label>
            <label className="block text-xs font-medium">
              Nơi cấp
              <Input
                className="mt-1 h-8 text-xs"
                value={safe(customer.identityPlace)}
                onChange={(e) => handleChange('customer.identityPlace', e.target.value)}
                disabled={!isEditable}
              />
            </label>
          </div>
          <label className="block text-xs font-medium">
            Địa chỉ thường trú
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.address)}
              onChange={(e) => handleChange('customer.address', e.target.value)}
              disabled={!isEditable}
            />
          </label>
          <label className="block text-xs font-medium">
            Gửi về địa chỉ
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.returnAddress)}
              onChange={(e) => handleChange('customer.returnAddress', e.target.value)}
              disabled={!isEditable}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Thông tin giao hàng &amp; Ghi chú
        </h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Tiền Khách Đã Thanh Toán
            <Input
              className="mt-1 h-8 text-xs"
              type="number"
              value={safe(totals.amountPaid)}
              onChange={(e) => {
                const paid = Number(e.target.value) || 0
                handleChange('totals.amountPaid', paid)
                const total = totals.totalAmount || 0
                const due = total - paid > 0 ? total - paid : 0
                handleChange('totals.amountDue', due)
              }}
              disabled={!isEditable}
            />
          </label>
          <label className="block text-xs font-medium">
            Ngày giao hàng
            <Input
              className="mt-1 h-8 text-xs"
              type="date"
              value={safe(payment.deliveryDate)}
              onChange={(e) => handleChange('payment.deliveryDate', e.target.value)}
              disabled={!isEditable}
            />
          </label>
        </div>
      </div>
    </div>
  )

  const previewContent = (
    <div className="flex-1 overflow-auto rounded border bg-muted/40 p-2">
      <div className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
        <span>Xem trước (Mẫu 3)</span>
        <span className="hidden md:inline">(Nội dung sơ bộ khi in Word)</span>
      </div>
      <div className={isMobile
        ? "overflow-x-auto overflow-y-auto border bg-white max-w-full"
        : "overflow-auto border bg-white"
      }>
        <div style={isMobile ? {
          transform: 'scale(0.45)',
          transformOrigin: 'top left',
          minWidth: '210mm',
        } : {}}>
          <ExportInstallmentV3 data={formData} />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        isViewInvoiceDialog={false}
        className={cn(
          isMobile
            ? "max-w-full w-full h-[100dvh] inset-0 p-0 gap-0 flex flex-col top-0 left-0 right-0 m-0 rounded-none translate-x-0 translate-y-0 z-[10000]"
            : "max-w-[80vw] gap-4",
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        {isMobile ? (
          <>
            <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b">
              <DialogTitle className="text-base">
                Xem trước hợp đồng V3 (Mẫu 3)
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
                    <span>Xem trước (Mẫu 3)</span>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto border-t bg-white">
                    <div style={{
                      transform: 'scale(0.45)',
                      transformOrigin: 'top left',
                      minWidth: '210mm',
                    }}>
                      <ExportInstallmentV3 data={formData} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="px-4 py-3 pb-12 shrink-0 flex flex-col gap-2 border-t bg-background">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onConfirm?.(formData)
                  }}
                  className="flex-1"
                >
                  Xuất File Word
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                Xem trước hợp đồng V3 (Mẫu 3)
              </DialogTitle>
            </DialogHeader>

            <div className="flex h-[80vh] gap-4 overflow-hidden">
              <div className="w-[30%] overflow-y-auto pr-2">
                {formFieldsContent}
              </div>
              {previewContent}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onConfirm?.(formData)
                }}
              >
                Xuất File Word
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
