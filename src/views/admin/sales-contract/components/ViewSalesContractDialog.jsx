import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { getSalesContractDetail } from '@/stores/SalesContractSlice'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { Badge } from '@/components/ui/badge'
import { statuses, paymentStatuses } from '../data'
import { useDispatch } from 'react-redux'

const ViewSalesContractDialog = ({
  open,
  onOpenChange,
  contractId,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && contractId) {
      fetchContractDetail()
    }
  }, [open, contractId])

  const fetchContractDetail = async () => {
    setLoading(true)
    try {
      const result = await dispatch(getSalesContractDetail(contractId)).unwrap()
      setContract(result)
    } catch (error) {
      console.error('Fetch contract error:', error)
    } finally {
      setLoading(false)
    }
  }

  const status = statuses.find((s) => s.value === contract?.status)
  const paymentStatus = paymentStatuses.find(
    (s) => s.value === contract?.paymentStatus,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết hợp đồng bán hàng</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : contract ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Số hợp đồng</label>
                <p className="text-lg">{contract.contractNumber}</p>
              </div>
              <div>
                <label className="text-sm font-semibold">Ngày ký</label>
                <p>{dateFormat(contract.contractDate)}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex gap-4">
              {status && (
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              )}
              {paymentStatus && (
                <Badge variant="outline" className={paymentStatus.color}>
                  {paymentStatus.label}
                </Badge>
              )}
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded">
                <div>
                  <label className="text-sm text-muted-foreground">Tên</label>
                  <p>{contract.customer?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Số điện thoại
                  </label>
                  <p>{contract.customer?.phone}</p>
                </div>
                {contract.customer?.idCard && (
                  <div>
                    <label className="text-sm text-muted-foreground">CCCD</label>
                    <p>{contract.customer.idCard}</p>
                  </div>
                )}
                {contract.customer?.address && (
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground">
                      Địa chỉ
                    </label>
                    <p>{contract.customer.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold mb-2">Danh sách sản phẩm</h3>
              <div className="border rounded">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">STT</th>
                      <th className="p-2 text-left">Sản phẩm</th>
                      <th className="p-2 text-right">SL</th>
                      <th className="p-2 text-right">Đơn giá</th>
                      <th className="p-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.items?.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          {moneyFormat(item.unitPrice)}
                        </td>
                        <td className="p-2 text-right">
                          {moneyFormat(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span>{moneyFormat(contract.totalAmount)}</span>
              </div>
              {contract.paidAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Đã thanh toán:</span>
                  <span>{moneyFormat(contract.paidAmount)}</span>
                </div>
              )}
            </div>

            {/* Payment Terms */}
            {contract.paymentTerms && (
              <div>
                <label className="text-sm font-semibold">Điều khoản thanh toán</label>
                <p className="text-sm text-muted-foreground">
                  {contract.paymentTerms}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t pt-4 flex gap-2">
              <Button
                variant="default"
                onClick={() => {
                  // Navigate to create invoice with contract data
                  window.location.href = `/invoice?contractId=${contractId}`
                }}
              >
                Tạo hóa đơn từ hợp đồng này
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <p>Không tìm thấy hợp đồng</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewSalesContractDialog
