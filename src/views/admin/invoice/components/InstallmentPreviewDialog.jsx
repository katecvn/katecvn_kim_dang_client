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
import ExportInstallment from './ExportInstallment'

const safe = (v, fallback = '') => (v === 0 || v ? String(v) : fallback)

export default function InstallmentPreviewDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
}) {
  const [formData, setFormData] = useState(initialData || {})
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    if (!initialData) {
      setFormData({})
      return
    }
    // Ensure seller object exists with defaults
    const defaultSeller = {
      name: 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG',
      representative: '',
      address: '47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam',
      phone: '0984490249',
    }
    const mergedData = {
      ...initialData,
      seller: { ...defaultSeller, ...initialData.seller }
    }
    setFormData(mergedData)
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
  const seller = formData.seller ?? {}
  const customer = formData.customer ?? {}
  const payment = formData.payment ?? {}

  // Form fields JSX (not a function component to avoid re-creation on render)
  const formFieldsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Thông tin hợp đồng</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Số hợp đồng
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(contract.no)}
              onChange={(e) => handleChange('contract.no', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Thông tin bên bán
        </h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Bên bán
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(seller.name)}
              onChange={(e) =>
                handleChange('seller.name', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            Đại diện
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(seller.representative)}
              onChange={(e) =>
                handleChange('seller.representative', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            Địa chỉ
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(seller.address)}
              onChange={(e) =>
                handleChange('seller.address', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            Điện thoại
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(seller.phone)}
              onChange={(e) =>
                handleChange('seller.phone', e.target.value)
              }
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
              onChange={(e) =>
                handleChange('customer.name', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            CCCD
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.identityCard)}
              onChange={(e) =>
                handleChange('customer.identityCard', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            Ngày cấp
            <Input
              className="mt-1 h-8 text-xs"
              type="date"
              value={safe(customer.identityDate)}
              onChange={(e) =>
                handleChange('customer.identityDate', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            Nơi cấp
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.identityPlace)}
              onChange={(e) =>
                handleChange('customer.identityPlace', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            Địa chỉ
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.address)}
              onChange={(e) =>
                handleChange('customer.address', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            Điện thoại
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.phone)}
              onChange={(e) =>
                handleChange('customer.phone', e.target.value)
              }
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Thông tin giao hàng
        </h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Ngày giao hàng
            <Input
              className="mt-1 h-8 text-xs"
              type="date"
              value={safe(payment.deliveryDate)}
              onChange={(e) =>
                handleChange('payment.deliveryDate', e.target.value)
              }
            />
          </label>
        </div>
      </div>
    </div>
  )

  // Preview content JSX (not a function component to avoid re-creation on render)
  const previewContent = (
    <div className="flex-1 overflow-auto rounded border bg-muted/40 p-2">
      <div className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
        <span>Xem trước</span>
        <span className="hidden md:inline">(Nội dung như khi in/export PDF)</span>
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
          <ExportInstallment data={formData} />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isMobile
          ? "max-w-full w-full h-full p-0 gap-0 flex flex-col"
          : "max-w-[80vw] gap-4"
        }
      >
        {/* Mobile: Complete custom layout */}
        {isMobile ? (
          <>
            <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b">
              <DialogTitle className="text-base">
                Xem trước & chỉnh sửa hợp đồng trả chậm
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
                    <div style={{
                      transform: 'scale(0.45)',
                      transformOrigin: 'top left',
                      minWidth: '210mm',
                    }}>
                      <ExportInstallment data={formData} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="px-4 py-3 shrink-0 flex-row gap-2 border-t">
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
                Xác nhận & Xuất PDF
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* Desktop: Side-by-side layout */
          <>
            <DialogHeader>
              <DialogTitle>
                Xem trước & chỉnh sửa hợp đồng trả chậm
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
                Xác nhận & Xuất PDF
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}