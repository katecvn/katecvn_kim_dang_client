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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { setSupportStaff } from '@/stores/SchoolSlice'
import { getUsers } from '@/stores/UserSlice'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from '@radix-ui/react-icons'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { setSupportStaffSchema } from '../schema'

const ViewSchoolDialog = ({
  school,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const users = useSelector((state) => state.user.users)
  const loading = useSelector((state) => state.school.loading)

  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  const form = useForm({
    resolver: zodResolver(setSupportStaffSchema),
    defaultValues: {
      supportStaffId: school?.users.at(-1)?.id.toString() || '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await dispatch(
        setSupportStaff({
          schoolId: school.id,
          supportStaffId: data.supportStaffId,
        }),
      ).unwrap()
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Xem chi tiết
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Trường: {school.name}</DialogTitle>
          <DialogDescription>
            Chỉ định nhân viên phụ trách trường {school.name}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="container mx-auto space-y-4 p-4 lg:grid lg:grid-cols-[350px_1fr] lg:gap-4 lg:space-y-0">
            <Form {...form}>
              <form
                id="set-support-staff"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="supportStaffId"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel required={true}>
                        Chọn nhân viên phụ trách
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {users.map((user, index) => (
                            <FormItem
                              key={index}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={user.id.toString()} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {user.fullName}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </DialogClose>

          <Button form="set-support-staff" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ViewSchoolDialog
