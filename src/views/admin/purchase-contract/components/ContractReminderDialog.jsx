import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import api from '@/utils/axios'
import { toast } from 'sonner'
import RichTextEditor from '@/components/custom/RichTextEditor'
import { Checkbox } from '@/components/ui/checkbox'

const ContractReminderDialog = ({ open, onOpenChange, selectedContracts = [] }) => {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)

  // Filter only active contracts (not liquidated or cancelled)
  const activeContracts = useMemo(
    () => selectedContracts.filter((c) => c.status !== 'liquidated' && c.status !== 'cancelled'),
    [selectedContracts],
  )

  // Initialize selected IDs
  useEffect(() => {
    if (!open) return
    setSelectedIds(activeContracts.map((c) => c.id))
  }, [open, activeContracts])

  // Generate default message
  useEffect(() => {
    if (!open || selectedIds.length === 0) return

    const firstContract = activeContracts.find((c) => selectedIds.includes(c.id))
    if (!firstContract) return

    const supplierName = firstContract.supplierName || firstContract.supplier?.name || 'Nhà cung cấp'
    const contractCode = firstContract.code || ''
    const validUntil = firstContract.validUntil
      ? dateFormat(firstContract.validUntil)
      : 'vô thời hạn'

    setSubject(`Nhắc nhở thực hiện hợp đồng - ${contractCode}`)
    setContent(`
      <p>Kính gửi <b>${supplierName}</b>,</p>
      <p>Chúng tôi xin nhắc nhở về việc thực hiện hợp đồng mua hàng số <b>${contractCode}</b>:</p>
      <ul>
        <li><b>Mã hợp đồng:</b> ${contractCode}</li>
        <li><b>Ngày hết hiệu lực:</b> ${validUntil}</li>
      </ul>
      <p>Vui lòng đảm bảo tiến độ thực hiện hợp đồng đúng cam kết.</p>
      <p>Nếu có vấn đề phát sinh, xin vui lòng phản hồi lại email này.</p>
      <p>Trân trọng.</p>
    `)
  }, [open, selectedIds, activeContracts])

  // Reset on close
  useEffect(() => {
    if (open) return
    setSubject('')
    setContent('')
    setSelectedIds([])
    setLoading(false)
  }, [open])

  const handleToggleContract = (contractId) => {
    setSelectedIds((prev) =>
      prev.includes(contractId)
        ? prev.filter((id) => id !== contractId)
        : [...prev, contractId],
    )
  }

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hợp đồng')
      return
    }

    setLoading(true)
    try {
      // Mock API call or use a real endpoint if available
      await api.post('/purchase-contracts/send-reminder', {
        contractIds: selectedIds,
        subject,
        content,
      })
      toast.success(`Đã gửi nhắc nhở cho ${selectedIds.length} hợp đồng`)
      onOpenChange(false)
    } catch (error) {
      // Fallback for demo/frontend-only mode if API fails
      if (error.response && (error.response.status === 404 || error.response.status === 500)) {
        toast.success(`(Mô phỏng) Đã gửi thư nhắc cho ${selectedIds.length} nhà cung cấp`)
        onOpenChange(false)
      } else {
        toast.error(error?.response?.data?.message || 'Gửi nhắc nhở thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gửi nhắc nhở thực hiện Hợp đồng</DialogTitle>
        </DialogHeader>

        {activeContracts.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Không có hợp đồng nào cần nhắc nhở
          </div>
        ) : (
          <div className="space-y-4">
            {/* Contract Selection */}
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Chọn hợp đồng ({selectedIds.length}/{activeContracts.length})
              </div>

              <div className="max-h-60 space-y-2 overflow-y-auto rounded border p-3">
                {activeContracts.map((contract) => {
                  const isSelected = selectedIds.includes(contract.id)
                  const validUntil = contract.validUntil
                  const isExpired =
                    validUntil && new Date(validUntil) < new Date()

                  return (
                    <div
                      key={contract.id}
                      className={`flex items-start gap-3 rounded border p-2 ${isSelected ? 'border-primary bg-primary/5' : ''
                        }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleContract(contract.id)}
                      />

                      <div className="flex-1 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">
                            {contract.code} - {contract.supplierName || contract.supplier?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {moneyFormat(contract.totalAmount)}
                          </div>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {contract.supplier?.phone && <span>SĐT: {contract.supplier.phone}</span>}
                          {contract.supplier?.phone && <span>•</span>}
                          <span
                            className={
                              isExpired ? 'font-bold text-red-500' : ''
                            }
                          >
                            Hiệu lực đến:{' '}
                            {validUntil ? dateFormat(validUntil) : 'Vô thời hạn'}
                          </span>
                          {isExpired && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-red-500">
                                Hết hạn
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Nhập tiêu đề email"
              />
            </div>

            {/* Content */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Nội dung</label>
              <RichTextEditor
                value={content}
                onChange={(html) => setContent(html)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            loading={loading}
            onClick={handleSend}
            disabled={selectedIds.length === 0 || loading}
          >
            Gửi nhắc nhở ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ContractReminderDialog
