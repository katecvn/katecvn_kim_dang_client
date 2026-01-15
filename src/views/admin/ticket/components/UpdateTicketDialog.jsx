import { useEffect, useMemo, useState } from 'react'
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

import { ticketPriorities, ticketChannels } from '../data'
import { getCustomers } from '@/stores/CustomerSlice'
import { getInvoices } from '@/stores/InvoiceSlice'
import { getUsers } from '@/stores/UserSlice'
import { updateTicket } from '@/stores/TicketSlice'

import SearchableSelect from './SearchableSelect'
import { createTicketSchema } from '../schema'

// Label có dấu * cho field bắt buộc
const RequiredLabel = ({ children }) => (
  <FormLabel className="flex items-center gap-1">
    <span>{children}</span>
    <span className="text-destructive">*</span>
  </FormLabel>
)

const UpdateTicketDialog = ({
  ticket,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()

  const customers = useSelector((state) => state.customer.customers || [])
  const invoices = useSelector((state) => state.invoice.invoices || [])
  const users = useSelector((state) => state.user.users || [])

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = typeof controlledOpen !== 'undefined'
  const dialogOpen = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = (value) => {
    if (!isControlled) {
      setUncontrolledOpen(value)
    }
    onOpenChange?.(value)
  }

  // Parse meta từ ticket (string JSON hoặc object)
  const parsedMeta = useMemo(() => {
    if (!ticket?.meta) return {}
    if (typeof ticket.meta === 'string') {
      try {
        return JSON.parse(ticket.meta) || {}
      } catch {
        return {}
      }
    }
    return ticket.meta || {}
  }, [ticket])

  // Chuẩn hóa firstResponseAt sang dạng datetime-local (YYYY-MM-DDTHH:mm)
  const firstResponseLocal = useMemo(() => {
    if (!parsedMeta.firstResponseAt) return ''
    try {
      // Nếu đã là dạng YYYY-MM-DDTHH:mm thì trả luôn
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(parsedMeta.firstResponseAt)) {
        return parsedMeta.firstResponseAt.slice(0, 16)
      }
      const d = new Date(parsedMeta.firstResponseAt)
      if (isNaN(d.getTime())) return ''
      // toISOString() => UTC, slice(0,16) vẫn chấp nhận được cho form
      return d.toISOString().slice(0, 16)
    } catch {
      return ''
    }
  }, [parsedMeta])

  // Chuẩn hóa tags -> string
  const tagsString = useMemo(() => {
    if (!parsedMeta.tags) return ''
    if (Array.isArray(parsedMeta.tags)) {
      return parsedMeta.tags.join(', ')
    }
    if (typeof parsedMeta.tags === 'string') return parsedMeta.tags
    return ''
  }, [parsedMeta])

  const form = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      customerId: '',
      invoiceId: '',
      subject: '',
      description: '',
      priority: 'normal',
      channel: 'phone',
      assignedToUserId: '',
      metaSource: '',
      metaCustomerContact: '',
      metaFirstResponseAt: '',
      metaTags: '',
      metaNoteInternal: '',
    },
  })

  // Khi mở dialog hoặc ticket thay đổi -> set giá trị form
  useEffect(() => {
    if (!dialogOpen || !ticket) return

    form.reset({
      customerId: ticket.customerId ?? '',
      invoiceId: ticket.invoiceId ? String(ticket.invoiceId) : '',
      subject: ticket.subject || '',
      description: ticket.description || '',
      priority: ticket.priority || 'normal',
      channel: ticket.channel || 'phone',
      assignedToUserId: ticket.assignedToUserId
        ? String(ticket.assignedToUserId)
        : '',
      metaSource: parsedMeta.source || '',
      metaCustomerContact: parsedMeta.customerContact || '',
      metaFirstResponseAt: firstResponseLocal || '',
      metaTags: tagsString,
      metaNoteInternal: parsedMeta.noteInternal || '',
    })
  }, [dialogOpen, ticket, parsedMeta, firstResponseLocal, tagsString, form])

  // Khi mở dialog thì tải dữ liệu chọn
  useEffect(() => {
    if (!dialogOpen) return
    dispatch(getCustomers())
    dispatch(getInvoices({}))
    dispatch(getUsers())
  }, [dialogOpen, dispatch])

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
      await dispatch(updateTicket({ id: ticket.id, data: payload })).unwrap()
      handleOpenChange(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Chỉnh sửa phiếu hỗ trợ
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cập nhật phiếu hỗ trợ</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin phiếu hỗ trợ của khách hàng.
          </DialogDescription>
        </DialogHeader>

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
                    <RequiredLabel>Khách hàng</RequiredLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value ? String(field.value) : ''}
                        onChange={field.onChange}
                        options={customers.map((c) => ({
                          value: String(c.id),
                          label: `${c.code ? c.code + ' - ' : ''}${
                            c.name || c.fullName
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
                        options={invoices.map((inv) => ({
                          value: String(inv.id),
                          label: inv.code || `HĐ #${inv.id}`,
                        }))}
                        placeholder="Chọn hóa đơn"
                        emptyMessage="Không tìm thấy hóa đơn."
                        allowNone
                        noneLabel="Không chọn hóa đơn"
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
                  <RequiredLabel>Tiêu đề phiếu hỗ trợ</RequiredLabel>
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
                  <RequiredLabel>Nội dung chi tiết</RequiredLabel>
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
                    <RequiredLabel>Mức ưu tiên</RequiredLabel>
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
                    <RequiredLabel>Kênh tiếp nhận</RequiredLabel>
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

            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateTicketDialog
