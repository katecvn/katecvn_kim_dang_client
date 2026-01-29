import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react'
import { moneyFormat } from '@/utils/money-format'

const SilverPriceRate = () => {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const USD_VND_RATE = 25400

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD')

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()

        if (data.items && data.items.length > 0) {
          const xagPrice = data.items[0].xagPrice
          setPriceData({
            priceUsd: xagPrice,
            priceVnd: xagPrice * USD_VND_RATE,
            currency: 'USD',
            date: data.date || new Date().toISOString()
          })
        } else {
          throw new Error('Invalid data format')
        }
      } catch (err) {
        console.error('Failed to fetch silver price:', err)
        setPriceData({
          priceUsd: 31.50,
          priceVnd: 31.50 * USD_VND_RATE,
          isMock: true
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()

    // Refresh every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Giá Bạc (XAG) thế giới
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground font-bold">Ag</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {priceData ? `$${priceData.priceUsd.toFixed(2)}` : 'N/A'}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ oz</span>
            </div>

            <div className="text-sm font-medium text-blue-600">
              ~ {priceData ? moneyFormat(priceData.priceVnd) : '---'} VNĐ
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              {priceData?.isMock ? (
                <span className="text-amber-500 flex items-center gap-1">
                  <IconMinus size={12} /> Dữ liệu mô phỏng (API Error)
                </span>
              ) : (
                <span className="text-green-500 flex items-center gap-1">
                  <IconTrendingUp size={12} /> Cập nhật trực tiếp
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SilverPriceRate
