import { z } from 'zod'

const phoneRegex =
  /^(?:\+84|0)(?:3[2-9]|5[2689]|7[06789]|8[1-9]|9[0-9])[0-9]{7}$/

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
