import { z } from 'zod'

export const createTaskSchema = z.object({
  customerId: z
    .string({ required_error: 'Vui lòng chọn khách hàng' })
    .min(1, 'Vui lòng chọn khách hàng'),

  ticketId: z.string().optional(),

  title: z
    .string({ required_error: 'Vui lòng nhập tiêu đề nhiệm vụ' })
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề không được quá 200 ký tự'),

  description: z.string().optional(),

  priority: z.enum(['low', 'normal', 'high'], {
    required_error: 'Vui lòng chọn mức ưu tiên',
  }),

  status: z.enum(['open', 'in_progress', 'completed', 'canceled'], {
    required_error: 'Vui lòng chọn trạng thái',
  }),

  assignedToUserId: z
    .string()
    .optional()
    .refine((val) => !val || val === 'none' || !isNaN(Number(val)), {
      message: 'Nhân viên phụ trách không hợp lệ',
    }),

  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true // Không bắt buộc
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      { message: 'Ngày hạn hoàn thành không hợp lệ' },
    ),

  // Meta fields
  metaChannel: z
    .enum(['phone', 'email', 'zalo', 'facebook', 'direct'])
    .optional(),

  metaContactPerson: z.string().optional(),

  metaPhone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        // Loại bỏ mọi ký tự không phải số và kiểm tra độ dài 9-15 chữ số
        return /^\d{9,15}$/.test(val.replace(/\D/g, ''))
      },
      { message: 'Số điện thoại không hợp lệ' },
    ),

  metaRelatedInvoiceId: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        return /^\d+$/.test(val)
      },
      { message: 'ID hóa đơn phải là số nguyên' },
    ),

  metaTags: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        const tags = val
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
        return tags.every((tag) => tag.length <= 30)
      },
      { message: 'Mỗi tag không được quá 30 ký tự' },
    ),
})
