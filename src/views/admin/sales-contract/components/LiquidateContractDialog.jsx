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
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'
import { getPublicUrl } from '@/utils/file'

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
      toast.error(error?.message || (typeof error === 'string' ? error : 'Không thể lấy dữ liệu thanh lý'))
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (productId, newPrice) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, unitPrice: Number(newPrice) }
          : item
      )
    )
  }

  // Calculate summary based on current edited items
  const summary = useMemo(() => {
    if (!previewData || !items.length) return null

    const depositAmount = Number(previewData.summary?.depositAmount || 0)

    const newTotalAmount = items.reduce((sum, item) => {
      const subTotal = Number(item.quantity) * Number(item.unitPrice)
      const taxAmount = subTotal * Number(item.taxRate || 0) / 100
      const discountAmount = subTotal * Number(item.discountRate || 0) / 100
      return sum + subTotal + taxAmount - discountAmount
    }, 0)

    // settlement > 0: khách còn nợ công ty (payment_in)
    // settlement < 0: công ty trả lại khách (payment_out)
    const settlement = newTotalAmount - depositAmount

    return {
      newTotalAmount,
      depositAmount,
      settlement,
      settlementType: settlement > 0 ? 'payment_in' : 'payment_out'
    }
  }, [previewData, items])

  const handleSubmit = async () => {
    if (!items.length) return

    setSubmitting(true)
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          price: item.unitPrice,
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
                  {moneyFormat(previewData.summary?.totalActualValue)}
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
                      <TableHead className="text-right w-[180px]">Đơn giá</TableHead>
                      <TableHead className="text-right">Tiền thuế</TableHead>
                      <TableHead className="text-right">Tiền giảm giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const subTotal = Number(item.quantity) * Number(item.unitPrice)
                      const taxAmount = subTotal * Number(item.taxRate || 0) / 100
                      const discountAmount = subTotal * Number(item.discountRate || 0) / 100
                      const totalAmount = subTotal + taxAmount - discountAmount
                      return (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {item.productImage && (
                                <img src={getPublicUrl(item.productImage)} alt={item.productName} className="w-8 h-8 rounded object-cover shrink-0" />
                              )}
                              <div>
                                {item.productName}
                                <div className="text-xs text-muted-foreground">{item.productCode}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            <MoneyInputQuick
                              className="text-right h-8"
                              value={item.unitPrice}
                              onChange={(value) => handlePriceChange(item.productId, value)}
                              onFocus={(e) => e.target.select()}
                              min={0}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {moneyFormat(taxAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {moneyFormat(discountAmount)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {moneyFormat(totalAmount)}
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
                  const subTotal = item.quantity * item.unitPrice
                  const taxAmount = subTotal * (item.taxRate || 0)
                  const discountAmount = subTotal * (item.discountRate || 0)
                  const totalAmount = subTotal + taxAmount - discountAmount
                  return (
                    <div key={item.productId} className="rounded-lg border p-3 space-y-2 bg-card">
                      <div className="flex items-center gap-2 font-medium">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded object-cover shrink-0" />
                        )}
                        <div>
                          {item.productName}
                          <div className="text-xs text-muted-foreground">{item.productCode}</div>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">SL:</span>
                        <span className="ml-2 font-medium">{item.quantity}</span>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Đơn giá</label>
                        <MoneyInputQuick
                          className="text-right h-9 w-full"
                          value={item.unitPrice}
                          onChange={(value) => handlePriceChange(item.productId, value)}
                          onFocus={(e) => e.target.select()}
                          min={0}
                        />
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tiền thuế ({(item.taxRate || 0)}%):</span>
                        <span className="font-medium">{moneyFormat(taxAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tiền giảm giá ({(item.discountRate || 0)}%):</span>
                        <span className="font-medium">{moneyFormat(discountAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm font-semibold border-t pt-2">
                        <span>Thành tiền:</span>
                        <span>{moneyFormat(totalAmount)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Tổng giá trị hợp đồng:</span>
                <span className="font-medium">{moneyFormat(summary?.newTotalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã thanh toán (Cọc):</span>
                <span className="font-medium text-green-600">{moneyFormat(previewData.summary?.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Còn lại:</span>
                <span className="font-medium text-orange-500">{moneyFormat(summary?.settlement)}</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between items-center text-base">
                <span className="font-bold">Quyết toán:</span>
                <div className="text-right">
                  <span className={cn("font-bold text-lg", summary?.settlementType === 'payment_out' ? "text-red-600" : "text-green-600")}>
                    {moneyFormat(Math.abs(summary?.settlement))}
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
