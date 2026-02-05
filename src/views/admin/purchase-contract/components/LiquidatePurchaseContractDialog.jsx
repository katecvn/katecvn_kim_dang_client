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
  liquidatePurchaseContract,
} from '@/stores/PurchaseContractSlice'
import { moneyFormat } from '@/utils/money-format'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const LiquidatePurchaseContractDialog = ({
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
  console.log(previewData)
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

    const totalContractValue = previewData.summary?.contractValue || previewData.summary?.totalContractValue || 0
    const depositAmount = previewData.summary?.depositAmount || 0

    const totalMarketValue = items.reduce((sum, item) => {
      return sum + (item.quantity * item.marketPrice)
    }, 0)

    const priceDifference = totalMarketValue - totalContractValue

    // Logic for Purchase Contract Liquidation
    // Similar to Sales:
    // estimatedSettlement = depositAmount + priceDifference
    // If Settlement > 0: 'payment_out' (Company pays Supplier?) or 'payment_in'?
    // Let's re-evaluate context:
    // Sales Contract: "Payment Out" meant Company pays Customer.
    // Purchase Contract: We are the Buyer (Company). Supplier is the Seller.
    // If Market Price > Contract Price (Price Diff > 0):
    //    We contracted to buy at LOW price. Market is HIGH.
    //    If we liquidate (don't buy), we technically GAIN the difference?
    //    Or does the Supplier gain?
    //    Usually, if we cancel/liquidate, we settle the difference.
    //    Assuming symmetry with Sales:
    //    Sales: Customer bought at X. Market is X+10. Customer "sells back" at X+10. Company pays Customer diff.
    //    Purchase: We bought at X. Market is X+10. We "sell back" (return rights) to Supplier at X+10?
    //    If we liquidate, it means we STOP the contract.
    //
    //    Let's stick to the mathematical formula first and adjust label text.
    //    estimatedSettlement = depositAmount + priceDifference
    //
    //    If estimatedSettlement > 0:
    //      In Sales: Company PAYS Customer.
    //      In Purchase: Does Supplier PAY Company?
    //      If we put down Deposit. We want it back.
    //      If Market > Contract (We have a 'gain' in position), we should be compensated for giving it up?
    //      So Supplier pays Company. (Payment IN)
    //
    //    If estimatedSettlement < 0:
    //      In Sales: Customer PAYS Company.
    //      In Purchase: Company PAYS Supplier. (Payment OUT)

    //    Let's use safer labels: "Công ty thu về" vs "Công ty trả thêm"

    const estimatedSettlement = depositAmount + priceDifference

    return {
      totalContractValue,
      totalMarketValue,
      priceDifference,
      depositAmount,
      estimatedSettlement,
      // For Purchase:
      // Settlement > 0 => Company Receives (Payment IN)
      // Settlement < 0 => Company Pays (Payment OUT)
      settlementType: estimatedSettlement >= 0 ? 'payment_in' : 'payment_out'
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
        liquidatePurchaseContract({ id: contractId, data: payload })
      ).unwrap()

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Liquidate error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[900px]", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Thanh lý hợp đồng mua hàng</DialogTitle>
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
                <span className="text-muted-foreground">Nhà cung cấp:</span>
                <p className="font-medium">{previewData.contract?.supplierName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Giá trị HĐ:</span>
                <p className="font-medium text-primary">
                  {moneyFormat(previewData.contract?.totalAmount || previewData.summary?.contractValue)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <p className="font-medium text-green-600">
                  {moneyFormat(previewData.contract?.paidAmount || previewData.summary?.depositAmount)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
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
                  <span className={cn("font-bold text-lg", summary?.settlementType === 'payment_in' ? "text-green-600" : "text-red-600")}>
                    {moneyFormat(Math.abs(summary?.estimatedSettlement))}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary?.settlementType === 'payment_in'
                      ? 'Nhà cung cấp trả lại công ty'
                      : 'Công ty cần trả thêm NCC'}
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

export default LiquidatePurchaseContractDialog
