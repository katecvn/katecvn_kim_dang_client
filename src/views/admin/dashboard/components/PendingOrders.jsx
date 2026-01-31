
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { moneyFormat } from '@/utils/money-format'
import { format } from 'date-fns'

const PendingOrders = ({ salesBacklog = [], purchaseBacklog = [], loading = false }) => {

  const OrderItem = ({ item, type }) => {
    const isSale = type === 'sale'
    const name = isSale ? item.buyerName : item.supplierName
    const phone = isSale ? item.buyerPhone : item.supplierPhone

    return (
      <div className="flex items-center justify-between p-2 border-b last:border-0 hover:bg-muted/50 transition-colors">
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <Link
              to={isSale ? '/sales-backlog' : '/purchase-backlog'}
              className="font-medium text-sm hover:underline truncate"
            >
              {item.code}
            </Link>
            {item.items && item.items.length > 0 && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                - {item.items[0].productName} {item.items.length > 1 ? `(+${item.items.length - 1})` : ''}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {name} - {phone}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[80px]">
          <div className="font-semibold text-sm">{moneyFormat(item.totalAmount)}</div>
          <div className="text-[10px] text-muted-foreground">
            Hẹn: {item.deliveryDate ? format(new Date(item.deliveryDate), 'dd/MM') : '-'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full shadow-none">
      <CardHeader className="pb-3">
        <CardTitle>Đơn hàng chờ xử lý</CardTitle>
        <CardDescription>Đơn bán chưa giao & Đơn mua chưa nhận</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="sales" className="w-full">
          <div className="px-4 pb-2">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="sales">Chưa giao ({salesBacklog.length})</TabsTrigger>
              <TabsTrigger value="purchases">Chưa nhận ({purchaseBacklog.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sales" className="m-0">
            <ScrollArea className="h-[300px]">
              <div className="px-4 pb-2">
                {loading ? (
                  <div className="py-8 text-center text-xs">Đang tải...</div>
                ) : salesBacklog.length > 0 ? (
                  salesBacklog.map(item => <OrderItem key={item.id} item={item} type="sale" />)
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">Không có đơn bán chưa giao</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="purchases" className="m-0">
            <ScrollArea className="h-[300px]">
              <div className="px-4 pb-2">
                {loading ? (
                  <div className="py-8 text-center text-xs">Đang tải...</div>
                ) : purchaseBacklog.length > 0 ? (
                  purchaseBacklog.map(item => <OrderItem key={item.id} item={item} type="purchase" />)
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">Không có đơn mua chưa nhận</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default PendingOrders
