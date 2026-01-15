import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateSchoolPricingPlanSchema } from '../schema'
import { CalendarIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/custom/DatePicker'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { updateSchoolPricingPlan } from '@/stores/SchoolSlice'
import { useDispatch, useSelector } from 'react-redux'
import { formatDateToYYYYMMDD } from '@/utils/date-format'

const UpdateSchoolPricingPlanDialog = ({
  school,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const form = useForm({
    resolver: zodResolver(updateSchoolPricingPlanSchema),
    defaultValues: {
      maxUser: school.maxUser,
      maxStudent: school.maxStudent,
      expDate: school.expirationTime,
    },
  })

  const loading = useSelector((state) => state.school.loading)
  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    try {
      const dataToSend = {
        schoolId: school.id,
        maxUser: data.maxUser,
        maxStudent: data.maxStudent,
        expDate: formatDateToYYYYMMDD(data.expDate),
      }

      await dispatch(updateSchoolPricingPlan(dataToSend)).unwrap()
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Cập nhật
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cập nhật gói: {school.name}</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để cập nhật thời gian sử dụng cho:{' '}
            <strong>{school.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="update-school-pricing-plan"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="expDate"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Ngày hết hạn</FormLabel>
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
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />

                      <FormDescription className="text-primary">
                        <strong className="text-destructive">Lưu ý:</strong> Tối
                        đa 29 ngày kể từ ngày hôm nay
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxUser"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Số lượng giáo viên</FormLabel>
                      <FormControl>
                        <Input
                          disabled
                          type="number"
                          placeholder="Nhập số lượng giáo viên"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStudent"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Số lượng học sinh</FormLabel>
                      <FormControl>
                        <Input
                          disabled
                          type="number"
                          placeholder="Nhập số lượng học sinh"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
              }}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="update-school-pricing-plan" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateSchoolPricingPlanDialog
