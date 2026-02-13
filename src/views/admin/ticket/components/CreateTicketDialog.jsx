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
  DialogTrigger,
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

import { createTicket } from '@/stores/TicketSlice'
import { ticketPriorities, ticketChannels } from '../data'

// Các thunk lấy danh sách
import { getCustomers } from '@/stores/CustomerSlice'
import { getInvoices } from '@/stores/InvoiceSlice'
import { getUsers } from '@/stores/UserSlice'

import SearchableSelect from './SearchableSelect'
import { createTicketSchema } from '../schema'

const CreateTicketDialog = ({
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const customers = useSelector((state) => state.customer.customers || [])
  const invoices = useSelector((state) => state.invoice.invoices || [])
  const users = useSelector((state) => state.user.users || [])

  // Trạng thái mở/đóng khi không controlled
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  const isControlled = typeof controlledOpen !== 'undefined'
  const dialogOpen = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = (value) => {
    if (!isControlled) {
      setUncontrolledOpen(value)
    }
    onOpenChange?.(value)
  }

  // Khi mở dialog thì tải dữ liệu
  useEffect(() => {
    if (!dialogOpen) return
    dispatch(getCustomers())
    dispatch(getInvoices({}))
    dispatch(getUsers())
  }, [dialogOpen, dispatch])

  const form = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      customerId: '',
      invoiceId: '',
      subject: '',
      description: '',
      priority: 'normal',
      channel: 'phone',
      assignedToUserId: authUserWithRoleHasPermissions?.id?.toString() || '',
      metaSource: 'hotline',
      metaCustomerContact: '',
      metaFirstResponseAt: '',
      metaTags: '',
      metaNoteInternal: '',
    },
  })

  // === MỚI: theo dõi khách hàng đang chọn ===
  const selectedCustomerId = form.watch('customerId')

  // === MỚI: chỉ lấy hóa đơn của khách đó ===
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

    const meta = {
      ...(values.metaSource ? { source: values.metaSource } : {}),
      ...(values.metaCustomerContact
        ? { customerContact: values.metaCustomerContact }
        : {}),
      ...(values.metaFirstResponseAt
        ? { firstResponseAt: values.metaFirstResponseAt }
        : {}),
      ...(tags.length ? { tags } : {}),
      ...(values.metaNoteInternal
        ? { noteInternal: values.metaNoteInternal }
        : {}),
    }

    const invoiceId =
      values.invoiceId && values.invoiceId !== 'none'
        ? Number(values.invoiceId)
        : undefined

    const assignedToUserId =
      values.assignedToUserId && values.assignedToUserId !== 'none'
        ? Number(values.assignedToUserId)
        : undefined

    const payload = {
      customerId: values.customerId,
      subject: values.subject,
      description: values.description,
      priority: values.priority,
      channel: values.channel,
      ...(invoiceId ? { invoiceId } : {}),
      ...(assignedToUserId ? { assignedToUserId } : {}),
      ...(Object.keys(meta).length ? { meta } : {}),
    }

    try {
      await dispatch(createTicket(payload)).unwrap()
      handleOpenChange(false)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">+ Thêm phiếu hỗ trợ</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo phiếu hỗ trợ mới</DialogTitle>
          <DialogDescription>
            Ghi nhận phản ánh hoặc yêu cầu hỗ trợ từ khách hàng.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-1 md:max-h-[80vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 py-4"
            >
              {/* Hàng 1: Khách hàng, Hóa đơn */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Khách hàng</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value ? String(field.value) : ''}
                          onChange={(value) => {
                            // MỚI: đổi khách thì reset lại hóa đơn
                            field.onChange(value)
                            form.setValue('invoiceId', '')
                          }}
                          options={customers.map((c) => ({
                            value: String(c.id),
                            label: `${c.code ? c.code + ' - ' : ''}${c.name || c.fullName
                              }`,
                          }))}
                          placeholder="Chọn khách hàng"
                          emptyMessage="Không tìm thấy khách hàng."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hóa đơn</FormLabel>
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
                          noneLabel="Không chọn hóa đơn"
                          disabled={!selectedCustomerId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hàng 2: Tiêu đề */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={true}>Tiêu đề phiếu hỗ trợ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Lỗi phần mềm khi in hóa đơn"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hàng 3: Mô tả */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={true}>Nội dung chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Mô tả chi tiết vấn đề khách đang gặp phải, các bước thực hiện, thông báo lỗi hiển thị..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hàng 4: Mức ưu tiên, Kênh, Nhân viên phụ trách */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Mức ưu tiên</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn mức ưu tiên" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64 overflow-y-auto">
                            {ticketPriorities.map((item) => (
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
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Kênh tiếp nhận</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn kênh tiếp nhận" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64 overflow-y-auto">
                            {ticketChannels.map((item) => (
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
                      <FormLabel>Nhân viên phụ trách</FormLabel>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hàng 5: Thông tin bổ sung (meta) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="metaSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nguồn tiếp nhận</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: hotline, email, chat..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaCustomerContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thông tin liên hệ khách</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Số điện thoại, email của khách..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaFirstResponseAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời điểm phản hồi đầu tiên</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
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
                  <FormItem>
                    <FormLabel>Thẻ (tags) – phân cách bằng dấu phẩy</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: máy in, hóa đơn, khẩn cấp"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaNoteInternal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú nội bộ</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Ví dụ: Khách khó tính, cần chủ động cập nhật tiến độ thường xuyên."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-2 sticky bottom-0 bg-background pt-2 border-t">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Thêm mới
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTicketDialog
