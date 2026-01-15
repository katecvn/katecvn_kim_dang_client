import { z } from 'zod'

const phoneRegex =
  /^(?:\+84|0)(?:3[2-9]|5[2689]|7[06789]|8[1-9]|9[0-9])[0-9]{7}$/

const passwordSchema = z
  .string()
  .min(8, { message: 'Mật khẩu phải ít nhất 8 ký tự' })
  .regex(/[A-Z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa',
  })
  .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một số' })
  .regex(/[\W_]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' })

const createUserFormSchema = z.object({
  fullName: z.string().min(1, { message: 'Không được để trống' }),
  username: z.string().min(1, { message: 'Không được để trống' }),
  password: passwordSchema,
  roleId: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().optional(),
  phone: z
    .string()
    .nullable()
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  bankCode: z.string().optional(),
  bankName: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  positionId: z.string().min(1, { message: 'Không được để trống' }),
  status: z.string().min(1, { message: 'Không được để trống' }),
})

const updateUserFormSchema = z.object({
  fullName: z.string().min(1, { message: 'Không được để trống' }),
  username: z.string().min(1, { message: 'Không được để trống' }),
  roleId: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().optional(),
  phone: z
    .string()
    .nullable()
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  bankCode: z.string().optional(),
  bankName: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  positionId: z.string().min(1, { message: 'Không được để trống' }),
  status: z.string().min(1, { message: 'Không được để trống' }),
})
export { createUserFormSchema, updateUserFormSchema }
