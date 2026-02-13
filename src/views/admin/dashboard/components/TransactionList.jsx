import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'
import { moneyFormat } from '@/utils/money-format'
import { format } from 'date-fns'
import ViewReceiptDialog from '../../receipt/components/ViewReceiptDialog'
import ViewPaymentDialog from '../../payment/components/ViewPaymentDialog'

const TransactionList = ({ title, data = [], type, loading = false, description }) => {
  const [viewId, setViewId] = useState(null)
  console.log('data', data)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const handleView = (item) => {
    setViewId(item.id)
    if (type === 'receipt') {
      setShowReceiptDialog(true)
    } else {
      setShowPaymentDialog(true)
    }
  }

  const TransactionItem = ({ item }) => {
    const isReceipt = type === 'receipt'

    // The user provided JSON shows that for receipts, the partner info is in `receiver`.
    // It's likely in `payer` for payments (or vice versa depending on context, but let's check both).
    // Priority: partner > receiver > payer > customer > vendor
    const partnerObj = item.partner || item.receiver || item.payer || item.customer || item.vendor || {}

    // Name priority: Nested name -> Flat name -> Flat payer/receiver -> Fallback
    const rawName = partnerObj.name || item.name || item.payerName || item.receiverName
    const partnerName = rawName || 'Khách lẻ'

    const phone = partnerObj.phone || item.phone
    const address = partnerObj.address || item.address
    return (
      <div className="flex items-start justify-between p-2 border-b last:border-0 hover:bg-muted/50 transition-colors gap-2">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {/* Top: Code */}
          <div
            className="font-medium text-xs text-blue-600 hover:underline cursor-pointer w-fit"
            onClick={() => handleView(item)}
            title="Xem chi tiết"
          >
            {item.code}
          </div>

          {/* Middle: Name */}
          <div className="text-sm font-medium pr-2 break-words line-clamp-2 leading-tight" title={partnerName}>
            {partnerName}
          </div>

          {/* Bottom: Contact Info */}
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 flex-wrap min-h-[16px]">
            {phone && (
              <span className="whitespace-nowrap flex items-center gap-1 shrink-0" title="Số điện thoại">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-phone"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {phone}
              </span>
            )}
            {phone && address && <span className="text-muted-foreground/50 shrink-0">•</span>}
            {address && (
              <span className="break-words line-clamp-2 leading-tight" title={address}>
                {address}
              </span>
            )}
            {!phone && !address && partnerName !== 'Khách lẻ' && (
              <span className="italic text-muted-foreground/50">Không có thông tin liên hệ</span>
            )}
          </div>
        </div>

        {/* Right Side: Amount & Date */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className={`font-semibold text-sm ${isReceipt ? 'text-green-600' : 'text-red-600'}`}>
            {isReceipt ? '+' : '-'}{moneyFormat(item.amount)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {item.paymentDate ? format(new Date(item.paymentDate), 'HH:mm dd/MM') : '-'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full shadow-none border">
      <CardHeader className="p-4 pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Link to={type === 'receipt' ? '/receipt' : '/payment'} className="text-xs text-blue-600 hover:underline font-medium">
            Xem tất cả
          </Link>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px]">
          <div className="px-2 pb-2">
            {loading ? (
              <div className="py-8 text-center text-xs">Đang tải...</div>
            ) : data.length > 0 ? (
              data.map(item => <TransactionItem key={item.id} item={item} />)
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">Chưa có giao dịch</div>
            )}
          </div>
        </ScrollArea>

        {showReceiptDialog && (
          <ViewReceiptDialog
            open={showReceiptDialog}
            onOpenChange={setShowReceiptDialog}
            receiptId={viewId}
            showTrigger={false}
          />
        )}
        {showPaymentDialog && (
          <ViewPaymentDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            paymentId={viewId}
            showTrigger={false}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default TransactionList
