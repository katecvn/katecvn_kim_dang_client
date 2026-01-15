import { useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import api from '@/utils/axios'
import Pagination from '@/components/custom/Pagination'

const SaleHistoryColGroup = () => (
  <colgroup>
    <col className="w-[140px]" />
    <col className="w-[160px]" />
    <col />
    <col className="w-[100px]" />
    <col className="w-[120px]" />
    <col className="w-[120px]" />
    <col className="w-[120px]" />
    <col className="w-[120px]" />
  </colgroup>
)

const ProductSaleHistoryTab = ({ productId }) => {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [totalsByUnit, setTotalsByUnit] = useState([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const totalsText = useMemo(() => {
    if (!Array.isArray(totalsByUnit) || totalsByUnit.length === 0) return ''
    return totalsByUnit
      .map((x) => `${x.total} ${x.unitName}`)
      .filter(Boolean)
      .join(' • ')
  }, [totalsByUnit])

  const fetchData = async ({
    pageParam = page,
    fromDateParam = fromDate,
    toDateParam = toDate,
  } = {}) => {
    if (!productId) return

    setLoading(true)
    try {
      const response = await api.get(`/product/${productId}/sale-history`, {
        params: {
          page: pageParam,
          limit,
          fromDate: fromDateParam || undefined,
          toDate: toDateParam || undefined,
        },
      })

      const resData = response.data.data
      setData(resData.data)
      setPagination(resData.pagination)
      setTotalsByUnit(
        Array.isArray(resData.totalsByUnit) ? resData.totalsByUnit : [],
      )
    } catch (error) {
      console.error('Lỗi lấy lịch sử bán:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, fromDate, toDate, productId])

  const handleFilter = () => {
    setPage(1)
  }

  const handleClearFilter = () => {
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  return (
    <div className="min-h-[450px] space-y-4 md:min-h-[460px]">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Từ ngày</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Đến ngày</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <Button onClick={handleFilter}>Lọc</Button>

        {(fromDate || toDate) && (
          <Button variant="outline" onClick={handleClearFilter}>
            Xóa lọc
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
          <span className="text-muted-foreground">Tổng đã bán:</span>
          {loading ? (
            <span className="text-muted-foreground">...</span>
          ) : totalsText ? (
            <span className="font-medium">{totalsText}</span>
          ) : (
            <span className="text-muted-foreground">0</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Chưa có lịch sử bán
        </div>
      ) : (
        <div className="rounded-md border">
          <Table className="table-fixed">
            <SaleHistoryColGroup />
            <TableHeader>
              <TableRow className="bg-secondary text-xs">
                <TableHead>Ngày bán</TableHead>
                <TableHead>Hóa đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">ĐVT</TableHead>
                <TableHead className="text-right">Giá bán</TableHead>
                <TableHead className="text-right">Thuế</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          <div className="max-h-[400px] min-h-[400px] overflow-y-auto">
            <Table className="table-fixed">
              <SaleHistoryColGroup />
              <TableBody>
                {data.map((item) => {
                  const customer = item?.invoice?.customer || {}
                  const name = customer?.name
                  const phone = customer?.phone
                  const email = customer?.email
                  const address = customer?.address
                  const taxCode = customer?.taxCode

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="align-top">
                        {dateFormat(item.createdAt, true)}
                      </TableCell>

                      <TableCell className="font-mono align-top text-xs">
                        {item?.invoice?.code}
                      </TableCell>

                      <TableCell className="whitespace-normal align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="break-words font-medium">
                            {name || '—'}
                          </span>

                          {phone ? (
                            <span className="break-words text-xs text-primary">
                              {phone}
                            </span>
                          ) : null}

                          {taxCode ? (
                            <span className="break-words text-xs text-muted-foreground">
                              MST: {taxCode}
                            </span>
                          ) : null}

                          {email ? (
                            <span className="break-words text-xs text-muted-foreground">
                              {email}
                            </span>
                          ) : null}

                          {address ? (
                            <span className="break-words text-xs text-muted-foreground">
                              {address}
                            </span>
                          ) : null}

                          {!phone && !email && !address ? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className="text-right align-top">
                        {item.quantity}
                      </TableCell>

                      <TableCell className="text-right align-top">
                        {item.unitName}
                      </TableCell>

                      <TableCell className="text-right align-top">
                        {moneyFormat(item.price)}
                      </TableCell>

                      <TableCell className="text-right align-top">
                        {moneyFormat(item.taxAmount)}
                      </TableCell>

                      <TableCell className="text-right align-top font-semibold text-primary">
                        {moneyFormat(item.total)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default ProductSaleHistoryTab
