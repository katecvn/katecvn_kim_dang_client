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
import { PasswordInput } from '@/components/custom/PasswordInput'
import { useDispatch, useSelector } from 'react-redux'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSchoolSchema } from '../schema'
import { createSchool } from '@/stores/SchoolSlice'
import { toast } from 'sonner'
import { FilePond } from 'react-filepond'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import provinces from '@/utils/province'
import { getUsers } from '@/stores/UserSlice'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getCustomers } from '@/stores/CustomerSlice'
import CreateCustomerDialog from '../../customer/components/CreateCustomerDialog'
import { getAuthUserRolePermissions } from '@/stores/AuthSlice'
import { Switch } from '@/components/ui/switch'

const CreateSchoolDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.school.loading)
  const dispatch = useDispatch()
  const users = useSelector((state) => state.user.users)
  const authUserRolePermissions = useSelector(
    (state) => state.auth.authUserWithRoleHasPermissions,
  )

  const form = useForm({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: {
      author: '',
      account: '',
      name: '',
      email: '',
      phone: '',
      identifier: '',
      password: '',
      address: '',
      provinceId: '',
      userId: authUserRolePermissions?.id.toString() || '',
      allowUseKafoodApp: true,
    },
  })

  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)

  useEffect(() => {
    dispatch(getUsers())
    dispatch(getCustomers())
    dispatch(getAuthUserRolePermissions())
  }, [dispatch])

  const [logo, setLogo] = useState()
  const onSubmit = async (data) => {
    try {
      const file = logo && logo.length ? logo[0]?.file : null
      await dispatch(createSchool({ ...data, logo: file })).unwrap()
      form.reset()
      setLogo(null)
      onOpenChange?.(false)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger && (
          <DialogTrigger>
            <p className="cursor-pointer font-bold text-primary">+ Thêm mới</p>
          </DialogTrigger>
        )}

        <DialogContent className="md:h-auto md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thêm trường mới</DialogTitle>
            <DialogDescription>
              Điền vào chi tiết phía dưới để thêm trường mới
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
            <Form {...form}>
              <form id="create-school" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="col-span-full flex items-center justify-center">
                  <FilePond
                    className="h-36 w-36"
                    allowMultiple={false}
                    imagePreviewHeight="170"
                    imageCropAspectRatio="1:1"
                    imageResizeTargetWidth="200"
                    imageResizeTargetHeight="200"
                    styleLoadIndicatorPosition="center bottom"
                    styleProgressIndicatorPosition="right bottom"
                    styleButtonRemoveItemPosition="left bottom"
                    styleButtonProcessItemPosition="right bottom"
                    maxFiles={1}
                    maxFileSize="5MB"
                    acceptedFileTypes={['image/*']}
                    labelFileTypeNotAllowed="Loại file không hợp lệ"
                    stylePanelLayout="compact circle"
                    onupdatefiles={setLogo}
                    onprocessfile={(error) => {
                      if (error) {
                        toast.error('Lỗi khi tải tập tin')
                        return
                      }
                      toast.success('Tập tin đã được tải lên')
                    }}
                    onremovefile={(error) => {
                      if (error) {
                        toast.error('Lỗi khi xóa tập tin')
                        return
                      }
                      toast.success('Tập tin đã được xóa')
                    }}
                    name="filepond"
                    labelIdle='Kéo và thả hoặc <span class="filepond--label-action">chọn</span> tập tin'
                  />
                </div>

                <div className="my-4 grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required="true">Nhân viên</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhân viên phụ trách" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users &&
                              users.map((user) => (
                                <SelectItem
                                  key={user.id}
                                  value={user.id.toString()}
                                >
                                  {user.fullName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required="true">Tên trường</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên trường" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provinceId"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={true}>Tinh thành</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  '!mt-[4px] w-full justify-between font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value
                                  ? provinces.find(
                                      (province) => province.id === field.value,
                                    )?.name
                                  : 'Chọn tỉnh thành'}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Tìm kiếm..."
                                className="h-9"
                              />
                              <CommandEmpty>Không tìm thấy</CommandEmpty>
                              <CommandGroup>
                                <CommandList>
                                  {provinces &&
                                    provinces.map((province) => (
                                      <CommandItem
                                        value={province.id}
                                        key={province.id}
                                        onSelect={() => {
                                          form.setValue(
                                            'provinceId',
                                            province.id,
                                          )
                                          form.trigger('provinceId')
                                        }}
                                      >
                                        {province.name}
                                        <CheckIcon
                                          className={cn(
                                            'ml-auto h-4 w-4',
                                            province.id === field.value
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                </CommandList>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Địa chỉ</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập địa chỉ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required="true">Đại diện</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên người đại diện"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Mã định danh bộ giáo dục</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập mã định danh bộ giáo dục"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="new-password"
                            placeholder="Nhập địa chỉ email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />

                        <FormDescription>
                          <span className="text-primary">
                            <strong className="text-destructive">Lưu ý:</strong>{' '}
                            Địa chỉ email phải là duy nhất.
                          </span>
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required="true">Số điện thoại</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="new-password"
                            placeholder="Nhập số điện thoại"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />

                        <FormDescription>
                          <span className="text-primary">
                            <strong className="text-destructive">Lưu ý:</strong>{' '}
                            Số điện thoại phải là duy nhất.
                          </span>
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required="true">Tên tài khoản</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="new-password"
                            placeholder="Nhập tên tài khoản"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required="true">Mật khẩu</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Nhập mật khẩu"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-primary">
                          <strong className="text-destructive">Lưu ý:</strong>{' '}
                          Mật khẩu phải chứa ít nhất 8 ký tự, chữ hoa, chữ
                          thường và số.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="my-4 rounded-md border border-primary">
                  <FormField
                    control={form.control}
                    name="allowUseKafoodApp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-1">
                          <FormLabel>Sử dụng ứng dụng App Kafood</FormLabel>
                          <FormDescription>
                            Bằng cách bật tính năng này lên sẽ cho phép trường
                            có thể tạo tài khoản cho phụ huynh để sử dụng ứng
                            dụng Kafood
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => field.onChange(value)}
                          />
                        </FormControl>
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
                onClick={() => {
                  form.reset()
                  setLogo(null)
                }}
                type="button"
                variant="outline"
              >
                Hủy
              </Button>
            </DialogClose>

            <Button form="create-school" loading={loading}>
              Thêm mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCreateCustomerDialog && (
        <CreateCustomerDialog
          open={showCreateCustomerDialog}
          onOpenChange={setShowCreateCustomerDialog}
          showTrigger={false}
        />
      )}
    </div>
  )
}

export default CreateSchoolDialog
