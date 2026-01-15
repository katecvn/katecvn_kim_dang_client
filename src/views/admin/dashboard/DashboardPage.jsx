import React, { useEffect, useState } from 'react'
import Can from '@/utils/can'
import AdminReport from './components/AdminReport'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { endOfMonth, format, startOfMonth } from 'date-fns'
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

const DashboardPage = () => {
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

  const onSubmit = async (data) => {
    setFilters({
      fromDate: data.fromDate || filters.fromDate,
      toDate: data.toDate || filters.toDate,
    })
  }

  useEffect(() => {
    document.title = 'Katec - CRM'
  }, [])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 block items-center justify-between space-y-2 md:flex lg:flex">
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>

          <div>
            <Form {...form}>
              <form
                action=""
                id={'statistic-date-form'}
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
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy').toString()
                              ) : (
                                <span>Chọn ngày</span>
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
                              field.onChange(date)
                              onSubmit(form.getValues())
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
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy').toString()
                              ) : (
                                <span>Chọn ngày</span>
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
                              if (
                                field.name === 'fromDate' &&
                                form.getValues('toDate') &&
                                date > form.getValues('toDate')
                              ) {
                                alert('Từ ngày không thể lớn hơn đến ngày!')
                              } else if (
                                field.name === 'toDate' &&
                                form.getValues('fromDate') &&
                                date < form.getValues('fromDate')
                              ) {
                                alert('Đến ngày không thể nhỏ hơn từ ngày!')
                              } else {
                                field.onChange(date)
                              }
                              onSubmit(form.getValues())
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
        </div>

        <Can permission={['GET_REPORT']}>
          <AdminReport fromDate={filters.fromDate} toDate={filters.toDate} />
        </Can>
      </LayoutBody>
    </Layout>
  )
}

export default DashboardPage
