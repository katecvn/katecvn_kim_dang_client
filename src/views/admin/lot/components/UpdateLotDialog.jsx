import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
import { Calendar } from '@/components/ui/calendar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateLot, getLots } from '@/stores/LotSlice'
import { getProducts } from '@/stores/ProductSlice'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  productId: z.number({ required_error: 'Vui lòng chọn sản phẩm' }),
  code: z.string().min(1, 'Mã lô không được để trống'),
  initialQuantity: z.coerce.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
  unitCost: z.coerce.number().min(0, 'Giá vốn phải lớn hơn hoặc bằng 0'),
  manufactureDate: z.date({ required_error: 'Vui lòng chọn ngày sản xuất' }),
  expiryDate: z.date({ required_error: 'Vui lòng chọn hạn sử dụng' }),
  status: z.string().optional(),
})

export default function UpdateLotDialog({
  open,
  onOpenChange,
  lot,
  onSuccess,
  contentClassName,
  overlayClassName,
}) {
  const dispatch = useDispatch()
  const { products } = useSelector((state) => state.product)
  const [loading, setLoading] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: undefined,
      code: '',
      initialQuantity: 0,
      unitCost: 0,
      manufactureDate: undefined,
      expiryDate: undefined,
      status: 'active',
    },
  })

  useEffect(() => {
    if (open) {
      dispatch(getProducts())
    }
  }, [open, dispatch])

  useEffect(() => {
    if (lot && open) {
      form.reset({
        productId: lot.productId,
        code: lot.code,
        initialQuantity: lot.initialQuantity,
        unitCost: lot.unitCost,
        manufactureDate: lot.manufactureDate ? new Date(lot.manufactureDate) : undefined,
        expiryDate: lot.expiryDate ? new Date(lot.expiryDate) : undefined,
        status: lot.status,
      })
    }
  }, [lot, open, form])

  const onSubmit = async (data) => {
    if (!lot) return

    setLoading(true)
    try {
      await dispatch(updateLot({ id: lot.id, data })).unwrap()
      toast.success('Cập nhật lô hàng thành công')
      onOpenChange(false)
      onSuccess?.()
      dispatch(getLots())
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-[500px]', contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Cập nhật lô hàng</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Product Select */}
            <FormField
              control={form.control}
              name='productId'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Sản phẩm</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? products?.find((product) => product.id === field.value)?.name
                            : 'Chọn sản phẩm'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[400px] p-0'>
                      <Command>
                        <CommandInput placeholder='Tìm sản phẩm...' />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                          <CommandGroup>
                            {products?.map((product) => (
                              <CommandItem
                                value={product.name}
                                key={product.id}
                                onSelect={() => {
                                  form.setValue('productId', product.id)
                                  setOpenCombobox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    product.id === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã lô</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập mã lô' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='initialQuantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng ban đầu</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='unitCost'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá vốn</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='manufactureDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Ngày sản xuất</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy')
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='expiryDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Hạn sử dụng</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy')
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type='submit' disabled={loading}>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
