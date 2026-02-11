
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { moneyFormat } from '@/utils/money-format'
import { IconArrowRight } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import ViewInvoiceDialog from '../../invoice/components/ViewInvoiceDialog'
import { useState } from 'react'

const RecentSales = ({ recentSales = [], loading = false }) => {
  const [viewId, setViewId] = useState(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)

  const handleView = (invoice) => {
    setViewId(invoice.id)
    setShowInvoiceDialog(true)
  }

  return (
    <Card className="col-span-1 h-[800px] flex flex-col shadow-sm border-border/60">
      <CardHeader className="p-4 pb-3 border-b border-border/40 bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground/90">Đơn hàng gần đây</CardTitle>
          <Link to="/invoice" className="text-xs text-blue-600 hover:underline font-medium">
            Xem tất cả
          </Link>
        </div>
        <CardDescription className="text-xs">
          Giao dịch bán hàng mới nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4 pt-0">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-[40px] w-[40px] rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-[10px] w-[150px] rounded-md" />
                    <Skeleton className="h-[10px] w-[100px] rounded-md" />
                  </div>
                </div>
              ))
            ) : recentSales?.length ? (
              recentSales.map((invoice) => (
                <div className="flex items-start justify-between border-b pb-2 last:border-0 hover:bg-muted/50 transition-colors rounded-sm p-2" key={invoice.id}>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="font-medium text-sm truncate" title={invoice?.buyerName || invoice?.customerName || 'Khách lẻ'}>
                      {invoice?.buyerName || invoice?.customerName || 'Khách lẻ'}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span
                        className="font-semibold text-blue-600 cursor-pointer hover:underline"
                        onClick={() => handleView(invoice)}
                      >
                        {invoice?.code}
                      </span>
                    </div>
                    {invoice.invoiceItems?.length > 0 && (
                      <div className="text-[11px] text-muted-foreground truncate max-w-[200px]" title={invoice.invoiceItems.map(i => i.productName).join(', ')}>
                        {invoice.invoiceItems[0].productName}
                        {invoice.invoiceItems.length > 1 && ` (+${invoice.invoiceItems.length - 1})`}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[90px]">
                    <div className="font-medium text-sm text-green-600">{moneyFormat(invoice.totalAmount)}</div>
                    <div className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                      {format(new Date(invoice.createdAt), 'dd/MM HH:mm')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">Chưa có giao dịch nào</div>
            )}


          </div>
        </ScrollArea>

        {showInvoiceDialog && (
          <ViewInvoiceDialog
            open={showInvoiceDialog}
            onOpenChange={setShowInvoiceDialog}
            invoiceId={viewId}
            showTrigger={false}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default RecentSales
