
import EmptyState from '@/components/custom/EmptyState'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/utils/axios'
import { moneyFormat } from '@/utils/money-format'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

const PurchaseBacklogPage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/reports/purchases/backlog')
        setData(data.data || [])
      } catch (error) {
        console.log('Error fetching backlog: ', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <h2 className="text-2xl font-bold tracking-tight">Đơn mua chưa nhận</h2>
        </div>

        <div className="flex-1 overflow-auto rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Mã ĐH</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">Nhà cung cấp</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[300px]">Sản phẩm</th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Ngày hẹn</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Tổng tiền</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Đã trả</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Còn lại</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b transition-colors">
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[200px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                    </tr>
                  ))
                ) : data.length > 0 ? (
                  data.map((item) => {
                    const total = Number(item.totalAmount) || 0
                    const paid = Number(item.paidAmount) || 0
                    const remaining = total - paid

                    return (
                      <tr
                        key={item.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">{item.code}</td>
                        <td className="p-4 align-middle">
                          <div className="font-semibold">{item.supplierName}</div>
                          <div className="text-xs text-muted-foreground">{item.supplierPhone}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <ul className="list-disc pl-4 text-xs space-y-1">
                            {item.items?.map((prod) => (
                              <li key={prod.id}>
                                {prod.productName}
                                {Number(prod.quantity) > 1 && ` (x${Number(prod.quantity)})`}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-4 align-middle text-center">
                          {item.deliveryDate ? format(new Date(item.deliveryDate), 'dd/MM/yyyy') : '-'}
                        </td>
                        <td className="p-4 align-middle text-right">{moneyFormat(total)}</td>
                        <td className="p-4 align-middle text-right text-green-600">{moneyFormat(paid)}</td>
                        <td className="p-4 align-middle text-right text-red-600">{moneyFormat(remaining)}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      <EmptyState description="Không có đơn mua nào chưa nhận" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default PurchaseBacklogPage
