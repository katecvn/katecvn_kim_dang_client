import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getInventoryDetail, clearInventoryDetail } from '@/stores/WarehouseReportSlice'
import { getProducts } from '@/stores/ProductSlice'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/custom/Button'
import { cn } from '@/lib/utils'
import { CalendarIcon, FileSpreadsheet, Check, ChevronsUpDown } from 'lucide-react'
import { DatePicker } from '@/components/custom/DatePicker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { moneyFormat } from '@/utils/money-format'
import { exportDetailedLedgerToExcel } from '@/utils/export-detailed-ledger'
import { dateFormat } from '@/utils/date-format'
import ExportInventoryDetailPreviewDialog from './components/ExportInventoryDetailPreviewDialog'
import ViewWarehouseReceiptDialog from '../warehouse-receipt/components/ViewWarehouseReceiptDialog'
import ViewProductDialog from '../product/components/ViewProductDialog'
import { useSearchParams } from 'react-router-dom'

const InventoryDetailPage = () => {
  const dispatch = useDispatch()
  const { inventoryDetail, loading } = useSelector((state) => state.warehouseReport)
  const { products } = useSelector((state) => state.product)
  const current = new Date()

  const [searchParams] = useSearchParams()
  const urlProductId = searchParams.get('productId')
  const urlFromDate = searchParams.get('fromDate')
  const urlToDate = searchParams.get('toDate')

  const [filters, setFilters] = useState({
    fromDate: urlFromDate ? new Date(urlFromDate) : startOfMonth(current),
    toDate: urlToDate ? new Date(urlToDate) : endOfMonth(current),
    productId: urlProductId ? Number(urlProductId) : '',
  })

  const [openCombobox, setOpenCombobox] = useState(false)
  const [showExportPreview, setShowExportPreview] = useState(false)
  const [showViewReceiptDialog, setShowViewReceiptDialog] = useState(false)
  const [selectedReceiptId, setSelectedReceiptId] = useState(null)
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)

  // Fetch products on mount
  useEffect(() => {
    dispatch(getProducts())
  }, [dispatch])

  // Fetch detail when filter changes (and productId is set)
  useEffect(() => {
    document.title = 'Sổ chi tiết vật tư'
    if (filters.productId) {
      dispatch(getInventoryDetail(filters))
    }
  }, [dispatch, filters])

  // Clear data on unmount
  useEffect(() => {
    return () => {
      dispatch(clearInventoryDetail())
    }
  }, [dispatch])

  const form = useForm({
    defaultValues: {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    },
  })

  const onSubmit = (data) => {
    setFilters(prev => ({
      ...prev,
      fromDate: data.fromDate || prev.fromDate,
      toDate: data.toDate || prev.toDate,
    }))
  }

  const selectedProduct = products?.find(p => p.id === filters.productId)
  const productName = selectedProduct ? selectedProduct.name : 'Chưa chọn sản phẩm'

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Sổ Chi Tiết Vật Tư
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sản phẩm: <span
                className={cn(
                  "font-semibold text-primary",
                  filters.productId && "cursor-pointer hover:underline"
                )}
                onClick={() => {
                  if (filters.productId) {
                    setShowViewProductDialog(true)
                  }
                }}
              >
                {productName}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Product Select Combobox */}
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-[300px] justify-between"
                >
                  <span className="truncate flex-1 text-left">
                    {filters.productId
                      ? products.find((product) => product.id === filters.productId)?.name
                      : "Chọn sản phẩm..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Tìm sản phẩm..." />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                    <CommandGroup>
                      {products?.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.name}
                          onSelect={() => {
                            setFilters(prev => ({ ...prev, productId: product.id }))
                            setOpenCombobox(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.productId === product.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {product.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Form {...form}>
              <form id="inventory-detail-form" className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Từ ngày</span>
                              )}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date)
                                onSubmit({ ...form.getValues(), fromDate: date })
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <span className="text-muted-foreground">-</span>

                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Đến ngày</span>
                              )}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date)
                                onSubmit({ ...form.getValues(), toDate: date })
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </form>
            </Form>


            <Button
              variant="outline"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={() => setShowExportPreview(true)}
              disabled={!filters.productId}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            {showExportPreview && (
              <ExportInventoryDetailPreviewDialog
                open={showExportPreview}
                onOpenChange={setShowExportPreview}
                reportData={inventoryDetail}
                filters={filters}
                productName={productName}
              />
            )}
            {showViewReceiptDialog && (
              <ViewWarehouseReceiptDialog
                open={showViewReceiptDialog}
                onOpenChange={setShowViewReceiptDialog}
                receiptId={selectedReceiptId}
                showTrigger={false}
              />
            )}
            {showViewProductDialog && (
              <ViewProductDialog
                open={showViewProductDialog}
                onOpenChange={setShowViewProductDialog}
                productId={filters.productId}
                showTrigger={false}
              />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-md border">
          <Table className="relative w-full min-w-[1000px]">
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                <TableHead colSpan={2} className="text-center border-r border-b">Chứng từ</TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] border-r">Đối tượng (Diễn giải)</TableHead>
                <TableHead rowSpan={2} className="w-[60px] border-r">ĐVT</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-b">Nhập trong kỳ</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-b">Xuất trong kỳ</TableHead>
                <TableHead colSpan={3} className="text-center border-b">Tồn cuối kỳ</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="w-[100px] border-r">Số</TableHead>
                <TableHead className="w-[100px] border-r">Ngày</TableHead>

                {/* Nhập */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Thành tiền</TableHead>

                {/* Xuất */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Thành tiền</TableHead>

                {/* Tồn */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right min-w-[100px]">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Dư đầu */}
              <TableRow className="bg-muted/30">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r font-bold">Dư đầu kỳ</TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="text-right border-r font-medium">
                  {parseFloat(inventoryDetail?.openingBalance?.qty || 0)}
                </TableCell>
                <TableCell className="text-right border-r">
                  {moneyFormat(inventoryDetail?.openingBalance?.unitPrice || 0)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {moneyFormat(inventoryDetail?.openingBalance?.amount || 0)}
                </TableCell>
              </TableRow>

              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center">Đang tải...</TableCell>
                </TableRow>
              ) : !inventoryDetail?.data || inventoryDetail.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center">Không có dữ liệu (Vui lòng chọn sản phẩm và khoảng thời gian)</TableCell>
                </TableRow>
              ) : (
                inventoryDetail.data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell
                      className={cn(
                        "border-r font-medium",
                        item.warehouseReceiptId ? "text-blue-600 cursor-pointer hover:underline" : "text-foreground"
                      )}
                      onClick={() => {
                        if (item.warehouseReceiptId) {
                          setSelectedReceiptId(item.warehouseReceiptId)
                          setShowViewReceiptDialog(true)
                        }
                      }}
                    >
                      {item.documentCode}
                    </TableCell>
                    <TableCell className="border-r">{dateFormat(item.postingDate)}</TableCell>
                    <TableCell className="border-r">{item.objectName || item.description}</TableCell>
                    <TableCell className="border-r text-center">{item.unit?.name || item.unitName}</TableCell>

                    {/* Nhập */}
                    <TableCell className="text-right border-r font-medium text-green-600">
                      {parseFloat(item.qtyIn) > 0 ? parseFloat(item.qtyIn) : ''}
                    </TableCell>
                    <TableCell className="text-right border-r">
                      {parseFloat(item.qtyIn) > 0 ? moneyFormat(item.unitPriceIn || item.unitCost) : ''}
                    </TableCell>
                    <TableCell className="text-right border-r">
                      {parseFloat(item.amountIn) > 0 ? moneyFormat(item.amountIn) : ''}
                    </TableCell>

                    {/* Xuất */}
                    <TableCell className="text-right border-r font-medium text-orange-600">
                      {parseFloat(item.qtyOut) > 0 ? parseFloat(item.qtyOut) : ''}
                    </TableCell>
                    <TableCell className="text-right border-r">
                      {parseFloat(item.qtyOut) > 0 ? moneyFormat(item.unitPriceOut || item.unitCost) : ''}
                    </TableCell>
                    <TableCell className="text-right border-r">
                      {parseFloat(item.amountOut) > 0 ? moneyFormat(item.amountOut) : ''}
                    </TableCell>

                    {/* Tồn */}
                    <TableCell className="text-right border-r font-bold">{parseFloat(item.balanceQty)}</TableCell>
                    <TableCell className="text-right border-r">{moneyFormat(item.balanceUnitPrice || item.unitCost)}</TableCell>
                    <TableCell className="text-right font-bold">{moneyFormat(item.balanceAmount)}</TableCell>
                  </TableRow>
                ))
              )}

              {/* Cộng */}
              <TableRow className="font-bold bg-muted/50 border-t-2">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r text-center">Cộng phát sinh + Cuối kỳ</TableCell>
                <TableCell className="border-r"></TableCell>

                {/* Tổng Nhập */}
                <TableCell className="text-right border-r text-green-700">
                  {parseFloat(inventoryDetail?.summary?.totalQtyIn || 0)}
                </TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="text-right border-r text-green-700">
                  {moneyFormat(inventoryDetail?.summary?.totalAmountIn || 0)}
                </TableCell>

                {/* Tổng Xuất */}
                <TableCell className="text-right border-r text-orange-700">
                  {parseFloat(inventoryDetail?.summary?.totalQtyOut || 0)}
                </TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="text-right border-r text-orange-700">
                  {moneyFormat(inventoryDetail?.summary?.totalAmountOut || 0)}
                </TableCell>

                {/* Cuối kỳ */}
                <TableCell className="text-right border-r bg-blue-50">
                  {parseFloat(inventoryDetail?.summary?.closingQty || 0)}
                </TableCell>
                <TableCell className="border-r bg-blue-50"></TableCell>
                <TableCell className="text-right bg-blue-50">
                  {moneyFormat(inventoryDetail?.summary?.closingAmount || 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default InventoryDetailPage
