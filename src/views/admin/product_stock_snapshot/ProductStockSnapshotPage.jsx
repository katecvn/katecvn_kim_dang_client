import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { columns } from './components/Column'
import { getProductStockSnapshots } from '@/stores/ProductStockSnapshotSlice'

import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.jsx'
import { Button } from '@/components/custom/Button.jsx'
import { cn } from '@/lib/utils.js'
import { CalendarIcon } from 'lucide-react'
import { DatePicker } from '@/components/custom/DatePicker.jsx'

import { ProductStockSnapshotDataTable } from './components/ProductStockSnapshotDataTable'
import { FileSpreadsheet } from 'lucide-react'
import { exportGeneralInventoryToExcel } from '@/utils/export-general-inventory'

const ProductStockSnapshotPage = () => {
  const dispatch = useDispatch()
  const productStockSnapshots = useSelector(
    (state) => state.productStockSnapshot.productStockSnapshots,
  )
  const loading = useSelector((state) => state.productStockSnapshot.loading)

  const current = new Date()

  const [filters, setFilters] = useState({
    fromDate: startOfMonth(current),
    toDate: endOfMonth(current),
  })

  const form = useForm({
    defaultValues: {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    },
  })

  const onSubmit = (data) => {
    const fromDate = data.fromDate || filters.fromDate
    const toDate = data.toDate || filters.toDate

    setFilters({ fromDate, toDate })
  }

  useEffect(() => {
    document.title = 'Quản lý kho'
  }, [])

  useEffect(() => {
    dispatch(
      getProductStockSnapshots({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      }),
    )
  }, [dispatch, filters.fromDate, filters.toDate])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách sản phẩm nhập kho
            </h2>
          </div>

          <Form {...form}>
            <form
              id="stock-snapshot-date-form"
              className="flex items-center gap-3 sm:justify-end"
            >
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem className="mb-2 space-y-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left text-sm font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy').toString()
                            ) : (
                              <span>Từ ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto min-w-[fit-content] p-0"
                        align="start"
                      >
                        <DatePicker
                          initialFocus
                          mode="single"
                          captionLayout="dropdown-buttons"
                          fromYear={2018}
                          toYear={2035}
                          selected={field.value}
                          onSelect={(date) => {
                            if (!date) return
                            const currentValues = form.getValues()
                            if (
                              currentValues.toDate &&
                              date > currentValues.toDate
                            ) {
                              alert('Từ ngày không thể lớn hơn đến ngày!')
                              return
                            }
                            field.onChange(date)
                            onSubmit({ ...currentValues, fromDate: date })
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem className="mb-2 space-y-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left text-sm font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy').toString()
                            ) : (
                              <span>Đến ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto min-w-[fit-content] p-0"
                        align="start"
                      >
                        <DatePicker
                          initialFocus
                          mode="single"
                          captionLayout="dropdown-buttons"
                          fromYear={2018}
                          toYear={2035}
                          selected={field.value}
                          onSelect={(date) => {
                            if (!date) return
                            const currentValues = form.getValues()

                            if (
                              currentValues.fromDate &&
                              date < currentValues.fromDate
                            ) {
                              alert('Đến ngày không thể nhỏ hơn từ ngày!')
                              return
                            }

                            field.onChange(date)
                            onSubmit({ ...currentValues, toDate: date })
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => exportGeneralInventoryToExcel(productStockSnapshots, filters)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Báo Cáo Tổng Hợp
          </Button>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {productStockSnapshots && (
            <ProductStockSnapshotDataTable
              data={productStockSnapshots}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default ProductStockSnapshotPage
