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
import ExportInstallment from './ExportInstallment'

const safe = (v, fallback = '') => (v === 0 || v ? String(v) : fallback)

export default function InstallmentPreviewDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
}) {
  const [formData, setFormData] = useState(initialData || {})

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
  const installment = formData.installment ?? {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] gap-4">
        <DialogHeader>
          <DialogTitle>Xem trước & chỉnh sửa hợp đồng trả chậm</DialogTitle>
        </DialogHeader>

        <div className="flex h-[80vh] gap-4 overflow-hidden">
          <div className="w-[30%] overflow-y-auto pr-2">
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

            <h3 className="mb-2 mt-4 text-sm font-semibold">
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
                CMND/CCCD
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(customer.idCard)}
                  onChange={(e) =>
                    handleChange('customer.idCard', e.target.value)
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

            <h3 className="mb-2 mt-4 text-sm font-semibold">
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

            <h3 className="mb-2 mt-4 text-sm font-semibold">
              Thông tin trả góp (nếu có)
            </h3>
            <div className="space-y-2">
              <label className="block text-xs font-medium">
                Tiền trả trước (VNĐ)
                <Input
                  className="mt-1 h-8 text-xs"
                  type="number"
                  value={safe(installment.downPayment)}
                  onChange={(e) =>
                    handleChange('installment.downPayment', Number(e.target.value))
                  }
                />
              </label>
              <label className="block text-xs font-medium">
                Số tiền trả góp (VNĐ)
                <Input
                  className="mt-1 h-8 text-xs"
                  type="number"
                  value={safe(installment.installmentAmount)}
                  onChange={(e) =>
                    handleChange('installment.installmentAmount', Number(e.target.value))
                  }
                />
              </label>
              <label className="block text-xs font-medium">
                Số tháng trả góp
                <Input
                  className="mt-1 h-8 text-xs"
                  type="number"
                  value={safe(installment.installmentMonths)}
                  onChange={(e) =>
                    handleChange('installment.installmentMonths', Number(e.target.value))
                  }
                />
              </label>
              <label className="block text-xs font-medium">
                Lãi suất (%/tháng)
                <Input
                  className="mt-1 h-8 text-xs"
                  type="number"
                  step="0.1"
                  value={safe(installment.interestRate)}
                  onChange={(e) =>
                    handleChange('installment.interestRate', Number(e.target.value))
                  }
                />
              </label>
              <label className="block text-xs font-medium">
                Tiền trả hàng tháng (VNĐ)
                <Input
                  className="mt-1 h-8 text-xs"
                  type="number"
                  value={safe(installment.monthlyPayment)}
                  onChange={(e) =>
                    handleChange('installment.monthlyPayment', Number(e.target.value))
                  }
                />
              </label>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded border bg-muted/40 p-2">
            <div className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
              <span>Xem trước</span>
              <span>(Nội dung như khi in/export PDF)</span>
            </div>
            <div className="overflow-auto border bg-white">
              <ExportInstallment data={formData} />
            </div>
          </div>
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
      </DialogContent>
    </Dialog>
  )
}
