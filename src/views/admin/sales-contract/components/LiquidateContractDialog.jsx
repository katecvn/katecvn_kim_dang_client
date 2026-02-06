import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import {
  getLiquidationPreview,
  liquidateSalesContract,
} from '@/stores/SalesContractSlice'
import { moneyFormat } from '@/utils/money-format'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const LiquidateContractDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
  contentClassName,
  overlayClassName,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    if (open && contractId) {
      fetchPreviewData()
    } else {
      setPreviewData(null)
      setItems([])
    }
  }, [open, contractId])

  const fetchPreviewData = async () => {
    setLoading(true)
    try {
      const result = await dispatch(getLiquidationPreview(contractId)).unwrap()
      if (result && result.data) {
        setPreviewData(result.data)
        // Initialize editable items with current market prices from preview
        if (result.data.items) {
          setItems(
            result.data.items.map((item) => ({
              ...item,
              marketPrice: item.currentMarketPrice || 0,
            }))
          )
        }
      }
    } catch (error) {
      console.error('Fetch liquidation preview error:', error)
      toast.error('Không thể lấy dữ liệu thanh lý')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (productId, newPrice) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, marketPrice: Number(newPrice) }
          : item
      )
    )
  }

  // Calculate summary based on current edited items
  const summary = useMemo(() => {
    if (!previewData || !items.length) return null

    const totalContractValue = previewData.summary?.totalContractValue || 0
    const depositAmount = previewData.summary?.depositAmount || 0

    const totalMarketValue = items.reduce((sum, item) => {
      return sum + (item.quantity * item.marketPrice)
    }, 0)

    const priceDifference = totalMarketValue - totalContractValue

    // Settlement: Amount needed to settle. 
    // If difference > 0 (Market > Contract), customer gains difference
    // Logic from user requirement:
    // estimatedSettlement = ... (This logic depends on business rule)
    // Based on provided JSON: "estimatedSettlement": 390000000 
    // And note: "Công ty sẽ trả khách 390.000.000đ"
    // Case 1: Paid 350M (deposit). Contract 700M. Market 740M. Diff 40M.
    // If we liquidate, we treat it as selling back to company at Market Price?
    // Or just compensating difference?
    // User JSON example:
    // Contract: 700M. Paid: 350M.
    // Market Val: 740M.
    // Result: Company pays customer 390M.
    // Calculation: (MarketValue - (ContractValue - PaidAmount))? 
    // 740 - (700 - 350) = 740 - 350 = 390. Correct.
    // Or simpler: PaidAmount + PriceDifference = 350 + 40 = 390. Correct.

    const estimatedSettlement = depositAmount + priceDifference

    return {
      totalContractValue,
      totalMarketValue,
      priceDifference,
      depositAmount,
      estimatedSettlement,
      settlementType: estimatedSettlement >= 0 ? 'payment_out' : 'payment_in'
    }
  }, [previewData, items])

  const handleSubmit = async () => {
    if (!items.length) return

    setSubmitting(true)
    try {
      const payload = {
        liquidationItems: items.map((item) => ({
          productId: item.productId,
          marketPrice: item.marketPrice,
        })),
      }

      await dispatch(
        liquidateSalesContract({ id: contractId, data: payload })
      ).unwrap()

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Liquidate error:', error)
      // toast.error(error?.message || (typeof error === 'string' ? error : 'Có lỗi xảy ra khi thanh lý hợp đồng'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[900px] h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto m-0 sm:m-4 rounded-none sm:rounded-lg top-0 sm:top-auto translate-y-0 sm:translate-y-[-50%]", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Thanh lý hợp đồng</DialogTitle>
          <DialogDescription>
            Xem trước và xác nhận thông tin thanh lý hợp đồng. Cập nhật giá thị trường nếu cần.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : previewData ? (
          <div className="space-y-6 py-4">
            {/* General Info */}
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <span className="text-muted-foreground">Mã hợp đồng:</span>
                <p className="font-medium">{previewData.contract?.code}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Khách hàng:</span>
                <p className="font-medium">{previewData.contract?.customerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Giá trị HĐ:</span>
                <p className="font-medium text-primary">
                  {moneyFormat(previewData.contract?.totalAmount)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <p className="font-medium text-green-600">
                  {moneyFormat(previewData.contract?.paidAmount)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            {isDesktop ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">SL</TableHead>
                      <TableHead className="text-right">Đơn giá HĐ</TableHead>
                      <TableHead className="text-right w-[180px]">Giá thị trường</TableHead>
                      <TableHead className="text-right">Chênh lệch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const diff = (item.marketPrice - item.contractPrice) * item.quantity
                      return (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">
                            {item.productName}
                            <div className="text-xs text-muted-foreground">{item.productCode}</div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {moneyFormat(item.contractPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              className="text-right h-8"
                              value={item.marketPrice}
                              onChange={(e) => handlePriceChange(item.productId, e.target.value)}
                              onFocus={(e) => e.target.select()}
                              min={0}
                            />
                          </TableCell>
                          <TableCell className={cn("text-right font-medium", diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "")}>
                            {moneyFormat(diff)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const diff = (item.marketPrice - item.contractPrice) * item.quantity
                  return (
                    <div key={item.productId} className="rounded-lg border p-3 space-y-2 bg-card">
                      <div className="font-medium">
                        {item.productName}
                        <div className="text-xs text-muted-foreground">{item.productCode}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">SL:</span>
                          <span className="ml-2 font-medium">{item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">Đơn giá HĐ:</span>
                          <div className="font-medium">{moneyFormat(item.contractPrice)}</div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Giá thị trường</label>
                        <Input
                          type="number"
                          className="text-right h-9"
                          value={item.marketPrice}
                          onChange={(e) => handlePriceChange(item.productId, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          min={0}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Chênh lệch:</span>
                        <span className={cn("font-semibold", diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "")}>
                          {moneyFormat(diff)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Tổng giá trị thị trường:</span>
                <span className="font-medium">{moneyFormat(summary?.totalMarketValue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Chênh lệch giá (Thị trường - HĐ):</span>
                <span className={cn("font-medium", summary?.priceDifference > 0 ? "text-green-600" : summary?.priceDifference < 0 ? "text-red-500" : "")}>
                  {moneyFormat(summary?.priceDifference)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Đã thanh toán (Cọc):</span>
                <span className="font-medium">{moneyFormat(summary?.depositAmount)}</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between items-center text-base">
                <span className="font-bold">Quyết toán:</span>
                <div className="text-right">
                  <span className={cn("font-bold text-lg", summary?.settlementType === 'payment_out' ? "text-red-600" : "text-green-600")}>
                    {moneyFormat(Math.abs(summary?.estimatedSettlement))}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary?.settlementType === 'payment_out'
                      ? 'Công ty sẽ trả lại khách'
                      : 'Khách cần trả thêm công ty'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Không có dữ liệu
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading || submitting || !items.length}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận thanh lý
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LiquidateContractDialog
