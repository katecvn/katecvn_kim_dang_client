import { z } from 'zod'

export const createTicketSchema = z.object({
  customerId: z.coerce.number().int().positive({
    message: 'Vui lòng nhập ID khách hàng hợp lệ',
  }),
  invoiceId: z
    .union([z.coerce.number().int().positive(), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  subject: z.string().min(5, {
    message: 'Tiêu đề tối thiểu 5 ký tự',
  }),
  description: z.string().min(5, {
    message: 'Mô tả tối thiểu 5 ký tự',
  }),
  priority: z.string().min(1, {
    message: 'Vui lòng chọn mức ưu tiên',
  }),
  channel: z.string().min(1, {
    message: 'Vui lòng chọn kênh',
  }),
  assignedToUserId: z
    .union([z.coerce.number().int().positive(), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),

  // Meta fields
  metaSource: z.string().optional(),
  metaCustomerContact: z.string().optional(),
  metaFirstResponseAt: z.string().optional(),
  metaTags: z.string().optional(), // nhập "printer, invoice, urgent"
  metaNoteInternal: z.string().optional(),
})
