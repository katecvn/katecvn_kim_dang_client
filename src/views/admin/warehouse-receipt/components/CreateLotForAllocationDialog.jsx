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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  quantity: z.coerce.number().min(0.0001, 'Số lượng phải lớn hơn 0'),
  batchNumber: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  note: z.string().optional(),
})

export default function CreateLotForAllocationDialog({
  open,
  onOpenChange,
  onSuccess,
  contentClassName,
  overlayClassName,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: '',
      batchNumber: '',
      code: '',
      name: '',
      note: ''
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        quantity: '',
        batchNumber: '',
        code: '',
        name: '',
        note: ''
      })
    }
  }, [open, form])

  const onSubmit = (data) => {
    onSuccess(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-[500px] z-[100050]', contentClassName)} overlayClassName={cn('z-[100049]', overlayClassName)}>
        <DialogHeader>
          <DialogTitle>Tạo Lô Mới</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>

            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='Nhập số lượng' step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='batchNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã lô (Batch Number)</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập mã lô từ NCC' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã quản lý (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder='Tự động sinh nếu trống' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên lô (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder='Tự động sinh nếu trống' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Ghi chú thêm...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type='submit'>
                Thêm vào sách
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
