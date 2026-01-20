import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { getPurchaseOrderDetail } from '@/api/purchase_order'
import { Skeleton } from '@/components/ui/skeleton'

const ViewPurchaseOrderDialog = ({
  open,
  onOpenChange,
  purchaseOrderId,
  showTrigger = true,
}) => {
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !purchaseOrderId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getPurchaseOrderDetail(purchaseOrderId)
        setPurchaseOrder(data)
      } catch (error) {
        console.error('Fetch purchase order error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [open, purchaseOrderId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn đặt hàng</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : purchaseOrder ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mã đơn</p>
                <p className="text-lg font-semibold">{purchaseOrder.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                <p className="text-lg font-semibold">{purchaseOrder.status}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Nhà cung cấp</p>
              <p className="font-semibold">{purchaseOrder.supplier?.name}</p>
              <p className="text-sm">{purchaseOrder.supplier?.phone}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Danh sách sản phẩm</p>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Sản phẩm</th>
                      <th className="p-2 text-right">Số lượng</th>
                      <th className="p-2 text-right">Đơn giá</th>
                      <th className="p-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">{item.price?.toLocaleString()}</td>
                        <td className="p-2 text-right">{item.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-medium">Tổng tiền:</span>
                <span className="text-lg font-bold">{purchaseOrder.amount?.toLocaleString()} VNĐ</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Không tìm thấy dữ liệu</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewPurchaseOrderDialog
