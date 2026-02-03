
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/utils/axios'
import { moneyFormat } from '@/utils/money-format'

const MarketPriceWidget = () => {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await api.get('/reports/market-prices')
        setPrices(res.data.data || [])
        setMetadata(res.data.metadata)
      } catch (error) {
        console.error('Failed to fetch market prices', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPrices()
  }, [])

  return (
    <Card className="col-span-1 border-none shadow-none bg-transparent">
      <CardHeader className="pl-0 pt-0">
        <CardTitle className="text-lg font-bold">Bảng giá thị trường</CardTitle>
        {metadata && (
          <p className="text-xs text-muted-foreground">
            Cập nhật: {new Date(metadata.lastUpdate).toLocaleString('vi-VN')}
          </p>
        )}
      </CardHeader>
      <CardContent className="pl-0">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {prices.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">Mã: {item.code}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">
                    Mua: {moneyFormat(item.buyPrice)}
                  </div>
                  <div className="text-sm font-bold text-red-600">
                    Bán: {moneyFormat(item.sellPrice)}
                  </div>
                </div>
              </div>
            ))}
            {prices.length === 0 && (
              <div className="text-sm text-center text-muted-foreground">Không có dữ liệu giá</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MarketPriceWidget
