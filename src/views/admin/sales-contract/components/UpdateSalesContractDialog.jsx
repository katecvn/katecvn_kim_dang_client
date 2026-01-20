import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateSalesContract, getSalesContractDetail } from '@/stores/SalesContractSlice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

const UpdateSalesContractDialog = ({ open, onOpenChange, contractId }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    if (open && contractId) {
      fetchContractDetail()
    }
  }, [open, contractId])

  const fetchContractDetail = async () => {
    setFetching(true)
    try {
      const data = await dispatch(getSalesContractDetail(contractId)).unwrap()
      setFormData({
        contractNumber: data.contractNumber,
        contractDate: data.contractDate?.split('T')[0],
        deliveryDate: data.deliveryDate?.split('T')[0] || '',
        paymentTerms: data.paymentTerms || '',
        status: data.status,
      })
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await dispatch(
        updateSalesContract({ id: contractId, data: formData }),
      ).unwrap()
      onOpenChange(false)
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật hợp đồng bán hàng</DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : formData ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Số hợp đồng *</Label>
              <Input
                value={formData.contractNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contractNumber: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày ký *</Label>
                <Input
                  type="date"
                  value={formData.contractDate}
                  onChange={(e) =>
                    setFormData({ ...formData, contractDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Ngày giao hàng</Label>
                <Input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Điều khoản thanh toán</Label>
              <Textarea
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        ) : (
          <p>Không tìm thấy hợp đồng</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UpdateSalesContractDialog
