import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'
import { moneyFormat } from '@/utils/money-format'
import { format } from 'date-fns'

const TransactionList = ({ title, data = [], type, loading = false, description }) => {

  const TransactionItem = ({ item }) => {
    const isReceipt = type === 'receipt'
    // Determine partner name based on receiver/payer type or just use the generic name field if available
    // Receipt/Payment API returns specific structure.
    // Usually: payerName / receiverName
    const partnerName = item.payerName || item.receiverName || 'Khách lẻ'

    // Link to detail? Maybe just link to the main list page for now.
    const linkPath = isReceipt ? '/receipt' : '/payment'

    return (
      <div className="flex items-center justify-between p-2 border-b last:border-0 hover:bg-muted/50 transition-colors">
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <Link
              to={linkPath}
              className="font-medium text-sm hover:underline truncate"
            >
              {item.code}
            </Link>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {partnerName}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[80px]">
          <div className={`font-semibold text-sm ${isReceipt ? 'text-green-600' : 'text-red-600'}`}>
            {isReceipt ? '+' : '-'}{moneyFormat(item.amount)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {item.paymentDate ? format(new Date(item.paymentDate), 'HH:mm') : '-'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full shadow-none border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px]">
          <div className="px-4 pb-2">
            {loading ? (
              <div className="py-8 text-center text-xs">Đang tải...</div>
            ) : data.length > 0 ? (
              data.map(item => <TransactionItem key={item.id} item={item} />)
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">Chưa có giao dịch</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default TransactionList
