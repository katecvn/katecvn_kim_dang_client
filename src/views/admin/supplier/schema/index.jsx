import { z } from 'zod'

const phoneRegex =
  /^(?:\+84|0)(?:2|3|5|7|8|9)[0-9]{8,9}$/

const createSupplierSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  email: z.string().optional(),
  phone: z
    .string(1, { message: 'Không dược để trống' })
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  taxCode: z.string().optional(),
  representative: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
})

const updateSupplierSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  email: z.string().optional(),
  phone: z
    .string(1, { message: 'Không dược để trống' })
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  taxCode: z.string().optional(),
  representative: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
})

const updateSupplierStatusSchema = z.object({
  status: z.string().nonempty('Trạng thái là bắt buộc'),
})

export {
  createSupplierSchema,
  updateSupplierSchema,
  updateSupplierStatusSchema,
}
