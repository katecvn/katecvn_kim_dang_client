import { z } from 'zod'

export const createExpirySchema = z.object({
  productId: z.number().min(1, { message: 'Không được để trống' }),
  customerId: z.number().min(1, { message: 'Không được để trống' }),
  name: z
    .string()
    .min(1, { message: 'Không được để trống' })
    .max(200, { message: 'Tối đa 200 ký tự' })
    .regex(/^[a-zA-Z0-9_.]+$/, {
      message:
        'Tên tài khoản chỉ được chứa chữ cái không dấu, số và dấu gạch dưới, dấu chấm, không có khoảng trắng',
    }),
  invoiceId: z.string().max(100, 'Tối đa 100 ký tự').optional(),
  startDate: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
  months: z.coerce.number().min(1, { message: 'Số tháng phải lớn hơn 0' }),
  alertDateStep: z.coerce.number().min(1, { message: 'Phải lớn hơn 0' }),
  options: z.array(z.string()).optional(),
  note: z.string().optional(),
  accountId: z.number().nullable().optional(),
  userId: z.number().min(1, { message: 'Không được để trống' }),
})

export const updateExpirySchema = z.object({
  productId: z.number().min(1, { message: 'Không được để trống' }),
  customerId: z.number().min(1, { message: 'Không được để trống' }),
  name: z
    .string()
    .min(1, { message: 'Không được để trống' })
    .max(200, { message: 'Tối đa 200 ký tự' })
    .regex(/^[a-zA-Z0-9_.]+$/, {
      message:
        'Tên tài khoản chỉ được chứa chữ cái không dấu, số và dấu gạch dưới, dấu chấm, không có khoảng trắng',
    }),
  invoiceId: z.string().max(100, 'Tối đa 100 ký tự').optional(),
  startDate: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
  months: z.coerce.number().min(1, { message: 'Số tháng phải lớn hơn 0' }),
  alertDateStep: z.coerce.number().min(1, { message: 'Phải lớn hơn 0' }),
  options: z.array(z.string()).optional(),
  note: z.string().optional(),
  accountId: z.number().nullable().optional(),
  userId: z.number().min(1, { message: 'Không được để trống' }),
})
