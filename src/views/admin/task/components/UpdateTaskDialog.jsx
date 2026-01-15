import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { getCustomers } from '@/stores/CustomerSlice'
import { getUsers } from '@/stores/UserSlice'
import { getTickets } from '@/stores/TicketSlice'
import { getTaskById, updateTask } from '@/stores/TaskSlice'
import { getInvoices } from '@/stores/InvoiceSlice'
import SearchableSelect from './SearchableSelect'
import { createTaskSchema } from '../schema'
import { priorityOptions, statusOptions, channelOptions } from '../data'

const UpdateTaskDialog = ({
  open: controlledOpen,
  onOpenChange,
  taskId,
  showTrigger = false,
}) => {
  const dispatch = useDispatch()
  const [loadingTask, setLoadingTask] = useState(false)

  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const customers = useSelector((state) => state.customer.customers || [])
  const users = useSelector((state) => state.user.users || [])
  const tickets = useSelector((state) => state.ticket.tickets || [])
  const invoices = useSelector((state) => state.invoice.invoices || []) // MỚI

  const isControlled = typeof controlledOpen !== 'undefined'
  const dialogOpen = isControlled ? controlledOpen : false

  const handleOpenChange = (value) => {
    onOpenChange?.(value)
  }

  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      customerId: '',
      ticketId: '',
      title: '',
      description: '',
      priority: 'normal',
      status: 'open',
      assignedToUserId: authUserWithRoleHasPermissions?.id?.toString() || '',
      dueDate: '',
      metaChannel: 'phone',
      metaContactPerson: '',
      metaPhone: '',
      metaRelatedInvoiceId: '',
      metaTags: '',
    },
  })

  useEffect(() => {
    if (!dialogOpen) return

    dispatch(getCustomers())
    dispatch(getUsers())
    dispatch(getTickets({ limit: 100 }))
    dispatch(getInvoices({})) // MỚI: lấy hóa đơn

    if (!taskId) return

    const loadTask = async () => {
      setLoadingTask(true)
      try {
        const data = await dispatch(getTaskById(taskId)).unwrap()

        let parsedMeta = {}
        if (data.meta) {
          try {
            parsedMeta =
              typeof data.meta === 'string' ? JSON.parse(data.meta) : data.meta
          } catch (e) {
            parsedMeta = {}
          }
        }

        const tags =
          Array.isArray(parsedMeta.tags) && parsedMeta.tags.length
            ? parsedMeta.tags.join(', ')
            : ''

        form.reset({
          customerId: data.customerId ? String(data.customerId) : '',
          ticketId: data.ticketId ? String(data.ticketId) : '',
          title: data.title || '',
          description: data.description || '',
          priority: data.priority || 'normal',
          status: data.status || 'open',
          assignedToUserId: data.assignedToUserId
            ? String(data.assignedToUserId)
            : 'none',
          dueDate: data.dueDate || '',
          metaChannel: parsedMeta.channel || 'phone',
          metaContactPerson: parsedMeta.contactPerson || '',
          metaPhone: parsedMeta.phone || '',
          metaRelatedInvoiceId: parsedMeta.relatedInvoiceId
            ? String(parsedMeta.relatedInvoiceId)
            : '',
          metaTags: tags,
        })
      } catch (error) {
        console.error('Lấy chi tiết task thất bại:', error)
      } finally {
        setLoadingTask(false)
      }
    }

    loadTask()
  }, [dialogOpen, taskId, dispatch, form])

  const selectedCustomerId = form.watch('customerId')

  const ticketOptions = selectedCustomerId
    ? tickets
        .filter((t) => String(t.customerId) === selectedCustomerId)
        .map((t) => ({
          value: String(t.id),
          label: `#${t.id} - ${t.subject}`,
        }))
    : []

  // MỚI: hóa đơn theo khách
  const invoiceOptions = selectedCustomerId
    ? invoices
        .filter((inv) => String(inv.customerId) === selectedCustomerId)
        .map((inv) => ({
          value: String(inv.id),
          label: inv.code || `HĐ #${inv.id}`,
        }))
    : []

  const onSubmit = async (values) => {
    const tags =
      values.metaTags
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean) || []

    const metaObject = {
      ...(values.metaChannel ? { channel: values.metaChannel } : {}),
      ...(values.metaContactPerson
        ? { contactPerson: values.metaContactPerson }
        : {}),
      ...(values.metaPhone ? { phone: values.metaPhone } : {}),
      ...(values.metaRelatedInvoiceId && values.metaRelatedInvoiceId !== 'none' // MỚI: bỏ qua none
        ? { relatedInvoiceId: Number(values.metaRelatedInvoiceId) }
        : {}),
      ...(tags.length ? { tags } : {}),
    }

    const assignedToUserId =
      values.assignedToUserId && values.assignedToUserId !== 'none'
        ? Number(values.assignedToUserId)
        : undefined

    const payload = {
      customerId: Number(values.customerId),
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      status: values.status,
      ...(values.ticketId ? { ticketId: Number(values.ticketId) } : {}),
      ...(values.dueDate ? { dueDate: values.dueDate } : {}),
      ...(assignedToUserId ? { assignedToUserId } : {}),
      ...(Object.keys(metaObject).length
        ? { meta: JSON.stringify(metaObject) }
        : {}),
    }

    try {
      await dispatch(updateTask({ id: taskId, data: payload })).unwrap()
      handleOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Cập nhật task thất bại:', error)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {showTrigger && <Button size="sm">Chỉnh sửa nhiệm vụ</Button>}

      <DialogContent className="md:h-[90vh] md:max-w-[40vw]">
        <DialogHeader>
          <DialogTitle>Cập nhật nhiệm vụ</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin nhiệm vụ chăm sóc khách hàng
            {taskId && ` (ID #${taskId})`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 py-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Khách hàng</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value)
                            form.setValue('ticketId', '')
                            form.setValue('metaRelatedInvoiceId', '') // MỚI: reset hóa đơn
                          }}
                          options={customers.map((c) => ({
                            value: String(c.id),
                            label: `${c.code ? c.code + ' - ' : ''}${
                              c.name || c.fullName
                            }`,
                          }))}
                          placeholder="Chọn khách hàng"
                          emptyMessage="Không tìm thấy khách hàng."
                          disabled={loadingTask}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ticketId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phiếu hỗ trợ</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={ticketOptions}
                          placeholder={
                            selectedCustomerId
                              ? 'Chọn phiếu hỗ trợ'
                              : 'Chọn khách hàng trước'
                          }
                          emptyMessage={
                            selectedCustomerId
                              ? 'Khách này chưa có phiếu hỗ trợ.'
                              : 'Chưa chọn khách hàng.'
                          }
                          allowNone
                          noneLabel="Không liên kết phiếu hỗ trợ"
                          disabled={!selectedCustomerId || loadingTask}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={true}>Tiêu đề nhiệm vụ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Gọi lại tư vấn gói gia hạn 12 tháng"
                        {...field}
                        disabled={loadingTask}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Nội dung công việc cần thực hiện..."
                        {...field}
                        disabled={loadingTask}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Ưu tiên</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={loadingTask}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn mức ưu tiên" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Trạng thái</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={loadingTask}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedToUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NV phụ trách</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value || 'none'}
                          onChange={field.onChange}
                          options={users.map((u) => ({
                            value: String(u.id),
                            label: u.fullName,
                          }))}
                          placeholder="Chọn nhân viên"
                          emptyMessage="Không tìm thấy nhân viên."
                          allowNone
                          noneLabel="Chưa phân công"
                          disabled={loadingTask}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn hoàn thành</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={loadingTask}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              new Date(field.value).toLocaleDateString('vi-VN')
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date ? date.toISOString() : '')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <h4 className="mb-4 font-medium">
                  Thông tin bổ sung (tùy chọn)
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="metaChannel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kênh liên lạc</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={loadingTask}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn kênh" />
                            </SelectTrigger>
                            <SelectContent>
                              {channelOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaContactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Người liên hệ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tên người liên hệ"
                            {...field}
                            disabled={loadingTask}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SĐT liên hệ"
                            {...field}
                            disabled={loadingTask}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* MỚI: Hóa đơn liên quan dùng danh sách + lọc theo khách */}
                  <FormField
                    control={form.control}
                    name="metaRelatedInvoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hóa đơn liên quan</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value || 'none'}
                            onChange={field.onChange}
                            options={invoiceOptions}
                            placeholder={
                              selectedCustomerId
                                ? 'Chọn hóa đơn'
                                : 'Chọn khách hàng trước'
                            }
                            emptyMessage={
                              selectedCustomerId
                                ? 'Khách này chưa có hóa đơn.'
                                : 'Chưa chọn khách hàng.'
                            }
                            allowNone
                            noneLabel="Không liên kết hóa đơn"
                            disabled={!selectedCustomerId || loadingTask}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="metaTags"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>
                        Thẻ (tags) – phân cách bằng dấu phẩy
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: renewal, important, follow-up"
                          {...field}
                          disabled={loadingTask}
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
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting || loadingTask}
          >
            {form.formState.isSubmitting ? 'Đang lưu...' : 'Cập nhật nhiệm vụ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateTaskDialog
