import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useSelector } from 'react-redux'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'

const PendingOrders = () => {

  const invoices = useSelector((state) => state.invoice.invoices)
  const purchaseOrders = useSelector((state) => state.purchaseOrder.purchaseOrders)

  // Filter Pending Sales (Delivery Status not delivered OR Status pending)
  const pendingSales = (invoices || []).filter(inv => {
    return inv.status !== 'cancelled' && inv.status !== 'draft' && (
      inv.deliveryStatus === 'not_delivered' || inv.deliveryStatus === 'delivering' || inv.status === 'pending'
    )
  })

  // Filter Pending Purchases (Not delivered yet)
  const pendingPurchases = (purchaseOrders || []).filter(po => {
    // User asked: "Tổng đơn mua chưa giao" -> Purchase orders not delivered (by supplier?) -> Not received
    return po.status !== 'cancelled' && po.status !== 'draft' && po.status !== 'completed'
  })

  const OrderItem = ({ item, type }) => (
    <div className="flex items-center justify-between p-2 border-b last:border-0 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col gap-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <Link
            to={type === 'sale' ? '/invoice' : '/purchase-order'}
            className="font-medium text-sm hover:underline truncate"
          >
            {item.code}
          </Link>
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
            {type === 'sale' ? item.status : item.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {type === 'sale' ? item.customerName : item.supplier?.name}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 min-w-[80px]">
        <div className="font-semibold text-sm">{moneyFormat(item.totalAmount)}</div>
        <div className="text-[10px] text-muted-foreground">{dateFormat(item.createdAt)}</div>
      </div>
    </div>
  )

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Đơn hàng chưa hoàn tất</CardTitle>
        <CardDescription>Danh sách các đơn chưa giao / chưa nhận</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="sales" className="w-full">
          <div className="px-4 pb-2">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="sales">Chưa nhận (Bán) <Badge variant="secondary" className="ml-2">{pendingSales.length}</Badge></TabsTrigger>
              <TabsTrigger value="purchases">Chưa giao (Mua) <Badge variant="secondary" className="ml-2">{pendingPurchases.length}</Badge></TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sales" className="m-0">
            <ScrollArea className="h-[300px]">
              <div className="px-4 pb-2">
                {pendingSales.length > 0 ? (
                  pendingSales.map(item => <OrderItem key={item.id} item={item} type="sale" />)
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">Không có đơn bán chưa hoàn tất</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="purchases" className="m-0">
            <ScrollArea className="h-[300px]">
              <div className="px-4 pb-2">
                {pendingPurchases.length > 0 ? (
                  pendingPurchases.map(item => <OrderItem key={item.id} item={item} type="purchase" />)
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">Không có đơn mua chưa hoàn tất</div>
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
