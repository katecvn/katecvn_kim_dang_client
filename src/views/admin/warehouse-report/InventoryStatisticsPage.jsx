import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCategories } from '@/stores/CategorySlice'
import { getSuppliers } from '@/stores/SupplierSlice'
import api from '@/utils/axios'

import { Layout, LayoutBody } from '@/components/custom/Layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/custom/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function InventoryStatisticsPage() {
  const dispatch = useDispatch()

  // States
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redux data
  const { categories } = useSelector((state) => state.category)
  const { suppliers } = useSelector((state) => state.supplier)

  // Selected supplier name for row rendering
  const selectedSupplier = suppliers?.find(s => s.id === selectedSupplierId)
  const supplierName = selectedSupplier?.name || 'Nhà Cung Cấp'

  useEffect(() => {
    dispatch(getCategories())
    dispatch(getSuppliers())
  }, [dispatch])

  // Automatically select 'Bạc' category by default if available, fallback to first category
  // Also automatically select the first supplier
  useEffect(() => {
    if (categories?.length > 0 && !selectedCategoryId) {
      const bacCategory = categories.find((c) => c.name.toLowerCase().includes('bạc'))
      if (bacCategory) {
        setSelectedCategoryId(bacCategory.id.toString())
      } else {
        setSelectedCategoryId(categories[0].id.toString())
      }
    }

    if (suppliers?.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(suppliers[0].id.toString())
    }
  }, [categories, suppliers, selectedCategoryId, selectedSupplierId])

  const handleFetchReport = useCallback(async () => {
    if (!selectedSupplierId || !selectedCategoryId) {
      setError('Vui lòng chọn cả Nhà cung cấp và Loại sản phẩm')
      return
    }

    setError('')
    setLoading(true)
    try {
      // API call to fetch statistics
      const response = await api.get(
        `/reports/inventory-statistics?categoryId=${selectedCategoryId}&supplierId=${selectedSupplierId}`
      )

      if (response.data && response.data.data) {
        setReportData(response.data.data)
      } else {
        setReportData([])
      }
    } catch (err) {
      console.error(err)
      setError('Có lỗi xảy ra khi lấy dữ liệu thống kê')
      setReportData([])
    } finally {
      setLoading(false)
    }
  }, [selectedSupplierId, selectedCategoryId, setError, setLoading, setReportData])

  // Automatically fetch report when both are selected
  useEffect(() => {
    if (selectedCategoryId && selectedSupplierId) {
      handleFetchReport()
    }
  }, [selectedCategoryId, selectedSupplierId, handleFetchReport])

  // Row structure based on image: Thiếu khách, [Tên NCC] thiếu, Bán lại [Tên NCC], Kho, Tổng của KĐ, Của KĐ
  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Thống kê sản phẩm</h2>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-4 border-b pb-4">
            <div className="flex items-end gap-4">
              <div className="w-[300px]">
                <label className="mb-2 block text-sm font-medium">Nhà cung cấp</label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn Nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[300px]">
                <label className="mb-2 block text-sm font-medium">Loại sản phẩm</label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn Loại sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleFetchReport} disabled={loading}>
                {loading ? 'Đang tải...' : 'Xem thống kê'}
              </Button>
            </div>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>

          {/* Data Table */}
          {reportData.length > 0 && (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="w-1/4 border-r font-bold text-center text-primary">CHỈ SỐ</TableHead>
                    {reportData.map((prod) => (
                      <TableHead key={prod.productId} className="border-r font-bold text-center">
                        {prod.productName}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Row 1: Thiếu khách (customerShortfall) */}
                  <TableRow>
                    <TableCell className="border-r font-medium text-purple-700 bg-purple-50/50">Thiếu khách</TableCell>
                    {reportData.map((prod) => (
                      <TableCell key={prod.productId} className="border-r text-right">
                        {prod.rows?.customerShortfall || 0}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Row 2: [NCC] thiếu (supplierShortfall) */}
                  <TableRow>
                    <TableCell className="border-r font-medium text-purple-700 bg-purple-50/50">
                      {supplierName.charAt(0).toUpperCase() + supplierName.slice(1).toLowerCase()} thiếu
                    </TableCell>
                    {reportData.map((prod) => (
                      <TableCell key={prod.productId} className="border-r text-right">
                        {prod.rows?.supplierShortfall || 0}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Row 3: Bán lại [NCC] (supplierReturn) */}
                  <TableRow>
                    <TableCell className="border-r font-bold text-red-600 bg-purple-50/50">
                      Bán lại {supplierName.toLowerCase()}
                    </TableCell>
                    {reportData.map((prod) => (
                      <TableCell key={prod.productId} className="border-r text-right font-bold text-red-600">
                        {prod.rows?.supplierReturn || 0}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Row 5: Kho (currentStock) */}
                  <TableRow>
                    <TableCell className="border-r font-bold text-purple-700 bg-purple-50/50">Kho</TableCell>
                    {reportData.map((prod) => (
                      <TableCell key={prod.productId} className="border-r text-right font-bold">
                        {prod.rows?.currentStock || 0}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Row 6: Tổng của KĐ (netBalance) */}
                  <TableRow className="bg-red-300">
                    <TableCell className="border-r py-3 font-bold text-black border-r-gray-400">Tổng của KĐ</TableCell>
                    {reportData.map((prod) => (
                      <TableCell key={prod.productId} className="border-r py-3 text-right font-bold text-black border-r-gray-400">
                        {prod.rows?.netBalance || 0}
                      </TableCell>
                    ))}
                  </TableRow>

                </TableBody>
              </Table>
            </div>
          )}

          {!loading && reportData.length === 0 && !error && (
            <div className="py-8 text-center text-muted-foreground border rounded-lg bg-white mt-4">
              Chưa có dữ liệu thống kê. Vui lòng chọn Nhà cung cấp, Loại sản phẩm và bấm "Xem thống kê".
            </div>
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}
