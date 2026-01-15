import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '@/utils/axios'

import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Package,
  Tag,
  FileText,
  User,
  Building2,
  PlusIcon,
  Ruler,
} from 'lucide-react'

import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'

import ProductSaleHistoryTab from './ProductSaleHistoryTab'

const ViewProductDialog = ({ productId, showTrigger = true, ...props }) => {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const res = await api.get(`/product/${productId}`)
      setProduct(res.data.data)
    } catch (e) {
      console.error('Fetch product error:', e)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const supplierPriceHistory = useMemo(() => {
    if (!product?.prices?.length) return []

    const map = new Map()
    product.prices.forEach((p) => {
      if (!map.has(p.supplierId)) {
        map.set(p.supplierId, {
          supplierId: p.supplierId,
          supplierName: p.supplierName,
          supplier: p.supplier,
          prices: [],
        })
      }
      map.get(p.supplierId).prices.push(p)
    })

    return Array.from(map.values()).map((s) => ({
      ...s,
      prices: s.prices.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    }))
  }, [product])

  const stockHistory = useMemo(() => {
    if (!product?.productStocks?.length) return []
    return [...product.productStocks].sort(
      (a, b) => new Date(b.snapshotDate) - new Date(a.snapshotDate),
    )
  }, [product])

  const latestStock = stockHistory[0] || null

  // =========================
  // NEW: base unit + conversions view model
  // =========================
  const baseUnitName = useMemo(() => {
    // ưu tiên baseUnit (nếu backend trả), fallback prices[0].unitName
    return (
      product?.baseUnit?.name ||
      product?.prices?.[0]?.unitName ||
      product?.prices?.[0]?.unit?.name ||
      '—'
    )
  }, [product])

  const conversionRows = useMemo(() => {
    const list = product?.unitConversions || []
    if (!list.length) return []

    // show newest first (optional)
    return [...list].sort((a, b) => {
      const ta = new Date(a?.createdAt || 0).getTime()
      const tb = new Date(b?.createdAt || 0).getTime()
      return tb - ta
    })
  }, [product])

  const convertedPrices = useMemo(() => {
    // Giá hiện tại theo base unit
    const basePrice = Number(product?.price || 0)
    if (!Number.isFinite(basePrice) || basePrice <= 0) return []

    return conversionRows
      .map((c) => {
        const factor = Number(c?.conversionFactor || 0)
        if (!Number.isFinite(factor) || factor <= 0) return null

        // Quy ước: 1 baseUnit = factor * unit
        // => price(unit) = price(baseUnit) / factor
        const unitPrice = basePrice / factor

        return {
          id: c.id,
          unitName: c?.unit?.name || c?.unitName || '—',
          factor,
          unitPrice,
        }
      })
      .filter(Boolean)
  }, [conversionRows, product])

  return (
    <Dialog {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>
            Chi tiết sản phẩm: {loading ? 'Đang tải...' : product?.name || '—'}
          </DialogTitle>
          <DialogDescription>
            Mã sản phẩm: <strong>{product?.code || '—'}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-auto">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : !product ? (
            <div className="py-12 text-center text-muted-foreground">
              Không tìm thấy sản phẩm
            </div>
          ) : (
            <Tabs defaultValue="info">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="sale-history">Lịch sử bán</TabsTrigger>
              </TabsList>

              {/* ================= TAB INFO ================= */}
              <TabsContent value="info">
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="flex-1 space-y-6 rounded-lg border p-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <Package className="h-5 w-5" />
                      Thông tin sản phẩm
                    </h2>

                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tên</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mã</span>
                          <span className="font-mono">{product.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loại</span>
                          <span>
                            {product.type === 'digital' ? 'Phần mềm' : 'Vật lý'}
                          </span>
                        </div>

                        {/* NEW: base unit */}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Đơn vị gốc
                          </span>
                          <span className="font-medium">{baseUnitName}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giá bán</span>
                          <span className="font-semibold text-primary">
                            {moneyFormat(product.price)} / {baseUnitName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Ngày tạo
                          </span>
                          <span>{dateFormat(product.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Cập nhật
                          </span>
                          <span>{dateFormat(product.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* NEW: Unit conversions display */}
                    <div className="rounded-lg border p-3">
                      <h3 className="mb-2 flex items-center gap-2 font-semibold">
                        <Ruler className="h-4 w-4" />
                        Đơn vị quy đổi
                      </h3>

                      {conversionRows.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          Sản phẩm chưa có đơn vị quy đổi.
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-secondary text-xs">
                              <TableHead>Quy ước</TableHead>
                              <TableHead className="text-right">
                                Giá theo đơn vị
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {conversionRows.map((c) => {
                              const unitName = c?.unit?.name || '—'
                              const factor = Number(c?.conversionFactor || 0)
                              const unitPrice =
                                Number(product?.price || 0) /
                                (factor > 0 ? factor : 1)

                              return (
                                <TableRow key={c.id}>
                                  <TableCell>
                                    <span className="font-medium">
                                      1 {baseUnitName}
                                    </span>{' '}
                                    ={' '}
                                    <span className="font-medium">
                                      {factor || '—'}
                                    </span>{' '}
                                    <span className="font-medium">
                                      {unitName}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {factor > 0 ? (
                                      <span className="font-semibold">
                                        {moneyFormat(unitPrice)} / {unitName}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        —
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    {product.coefficient && (
                      <div className="rounded-lg bg-secondary/50 p-3">
                        <h3 className="mb-2 flex items-center gap-2 font-semibold">
                          <Tag className="h-4 w-4" />
                          Hệ số lương
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Hệ số</span>
                          <strong>{product.coefficient.coefficient}x</strong>
                          <span>Hiệu lực</span>
                          <span>
                            {dateFormat(product.coefficient.effectiveDate)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-semibold">
                        <FileText className="h-5 w-5" />
                        Lịch sử giá theo NCC
                      </h3>

                      {supplierPriceHistory.map((s) => (
                        <div
                          key={s.supplierId}
                          className="mb-4 rounded border p-3"
                        >
                          <div className="mb-2 flex items-center gap-2 font-medium">
                            <Building2 className="h-4 w-4" />
                            {s.supplierName}
                          </div>

                          <Table>
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead>Giá nhập</TableHead>
                                <TableHead>Đơn vị</TableHead>
                                <TableHead>Ngày</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {s.prices.map((p) => (
                                <TableRow key={p.id}>
                                  <TableCell>
                                    {moneyFormat(p.basePrice || 0)}
                                  </TableCell>
                                  <TableCell>{p.unitName}</TableCell>
                                  <TableCell>
                                    {dateFormat(p.createdAt, true)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full space-y-6 rounded-lg border p-4 lg:w-80">
                    {latestStock && (
                      <div className="rounded bg-secondary/50 p-3 text-sm">
                        <div className="mb-2 font-semibold">Tồn kho</div>
                        <div className="flex justify-between">
                          <span>Số lượng</span>
                          <span>{latestStock.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá tồn</span>
                          <span className="font-semibold text-primary">
                            {moneyFormat(latestStock.price)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <div className="mb-2 flex items-center gap-2 font-semibold">
                        <User className="h-4 w-4" />
                        Người tạo
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              product.createdByUser?.fullName
                                ? `https://ui-avatars.com/api/?name=${product.createdByUser.fullName}`
                                : undefined
                            }
                          />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          {product.createdByUser?.fullName || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ================= TAB SALE HISTORY ================= */}
              <TabsContent value="sale-history">
                <ProductSaleHistoryTab productId={productId} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ViewProductDialog
