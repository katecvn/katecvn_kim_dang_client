import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'
import { moneyFormat } from '@/utils/money-format'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { IconShoppingCart, IconTruckDelivery, IconUser, IconPackage, IconCalendar } from '@tabler/icons-react'

const BacklogWidget = ({ title, data = [], type, loading = false, description }) => {

  const OrderItem = ({ item }) => {
    const isSale = type === 'sale'
    const name = isSale ? item.buyerName : item.supplierName
    // const phone = isSale ? item.buyerPhone : item.supplierPhone
    const linkPath = isSale ? '/sales-backlog' : '/purchase-backlog'

    const deliveryDate = item.deliveryDate ? new Date(item.deliveryDate) : null
    const isOverdue = deliveryDate && isPast(deliveryDate) && !isToday(deliveryDate)

    return (
      <div className="p-3 border-b last:border-0 hover:bg-muted/30 transition-colors group">
        <div className="flex items-start gap-3">
          {/* Icon Badge */}
          <div className={`
          flex-none w-10 h-10 rounded-full flex items-center justify-center
          ${isSale ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}
        `}>
            {isSale ? <IconShoppingCart size={18} /> : <IconTruckDelivery size={18} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {/* Row 1: Code */}
            <div className="flex items-center">
              <Link
                to={linkPath}
                className="font-bold text-sm hover:underline hover:text-primary truncate transition-colors"
              >
                {item.code}
              </Link>
            </div>

            {/* Row 2: Customer Name */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconUser size={12} className="flex-none" />
              <span className="truncate" title={name}>{name || 'Khách lẻ'}</span>
            </div>

            {/* Row 3: Product Info (Optional) */}
            {item.items && item.items.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 mt-0.5">
                <IconPackage size={12} className="flex-none" />
                <span className="truncate">
                  {item.items[0].productName} {item.items.length > 1 ? `(+${item.items.length - 1})` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Date / Status & Amount - New Row */}
        <div className="flex items-center justify-between mt-2 pl-[52px]">
          <span className="font-bold text-sm">{moneyFormat(item.totalAmount)}</span>
          {deliveryDate ? (
            <div className={`
              flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border
              ${isOverdue
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-slate-50 text-slate-600 border-slate-100'}
            `}>
              <IconCalendar size={10} />
              <span>{format(deliveryDate, 'dd/MM')}</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">-</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full shadow-sm border-border/60">
      <CardHeader className="p-4 pb-3 border-b border-border/40 bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground/90">{title}</CardTitle>
          {/* Optional badge count or action */}
        </div>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-full">
          <div className="">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-xs">Đang tải...</span>
              </div>
            ) : data.length > 0 ? (
              data.map(item => <OrderItem key={item.id} item={item} />)
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/60 gap-2">
                <IconPackage size={32} strokeWidth={1.5} />
                <span className="text-sm">Không có đơn hàng</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default BacklogWidget
