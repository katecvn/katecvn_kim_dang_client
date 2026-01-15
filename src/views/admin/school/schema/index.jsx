import { z } from 'zod'

const phoneNumberRegex =
  /^(0|84)(2[0-9]{1,2}|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/

const passwordSchema = z
  .string()
  .min(8, { message: 'Mật khẩu phải ít nhất 8 ký tự' })
  .regex(/[A-Z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa',
  })
  .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một số' })
  .regex(/[\W_]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' })

const createSchoolSchema = z.object({
  author: z
    .string()
    .min(1, { message: 'Không được để trống' })
    .max(100, 'Tối đa 100 ký tự'),
  account: z
    .string()
    .min(1, { message: 'Không được để trống' })
    .max(32, { message: 'Tối đa 32 ký tự' })
    .regex(/^[a-zA-Z0-9_.]+$/, {
      message:
        'Chỉ cho phép số, chữ cái, "_", "." và không được chứa khoảng trắng',
    }),
  name: z
    .string()
    .min(1, { message: 'Không được để trống' })
    .max(200, { message: 'Tối đa 200 ký tự' }),
  email: z
    .string()
    .email('Sai định dạng email.')
    .or(z.literal(''))
    .optional()
    .nullable(),
  phone: z
    .string()
    .min(1, { message: 'Không được để trống' })
    .regex(phoneNumberRegex, {
      message: 'Số điện thoại di động không hợp lệ',
    }),
  identifier: z
    .string()
    .max(20, { message: 'Tối đa 20 ký tự' })
    .optional()
    .nullable(),
  password: passwordSchema,
  address: z.string().optional().nullable(),
  provinceId: z.union([
    z.string().min(1, { message: 'Không được để trống' }),
    z.number().int().min(1, { message: 'Không được để trống' }),
  ]),
  userId: z.union([
    z.string().min(1, { message: 'Không được để trống' }),
    z.number().int().min(1, { message: 'Không được để trống' }),
  ]),
  allowUseKafoodApp: z.boolean(),
})

const updateSchoolPricingPlanSchema = z.object({
  maxUser: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Giá phải là số và lớn hơn hoặc bằng 0',
    }),
  maxStudent: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Giá phải là số và lớn hơn hoặc bằng 0',
    }),
  expDate: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .refine((date) => date > new Date(), {
      message: 'Ngày hết hạn phải là một ngày sau hôm nay',
    }),
})

const setSupportStaffSchema = z.object({
  supportStaffId: z.string().min(1, { message: 'Không được để trống' }),
})

const sizeLimits = { MB: 1024, GB: 1024, TB: 1023 }

const parseDecimal = (val) => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const s = val.trim().replace(',', '.')
    if (!/^\d+(\.\d+)?$/.test(s)) return NaN
    return parseFloat(s)
  }
  return NaN
}

export const sizeSchema = z
  .object({
    sizeType: z.enum(['MB', 'GB', 'TB'], {
      message: 'sizeType phải là MB, GB hoặc TB',
    }),
    sizeValue: z
      .union([z.string(), z.number()])
      .transform(parseDecimal)
      .pipe(
        z
          .number({ invalid_type_error: 'Dung lượng không hợp lệ' })
          .gt(0, { message: 'Dung lượng phải lớn hơn 0' })
          .finite(),
      ),
  })
  .superRefine((data, ctx) => {
    const { sizeType, sizeValue } = data
    const maxLimit = sizeLimits[sizeType]

    if (sizeValue > maxLimit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Dung lượng tối đa cho ${sizeType} là ${maxLimit}`,
        path: ['sizeValue'],
      })
    }
  })

const updateStorageSizeSettingSchema = z.object({
  internal: sizeSchema,
  lessonPlan: sizeSchema,
  image: sizeSchema,
})

const updateGoogleCredentialSchema = z.object({
  client_id: z.string().min(1, 'Client ID không được để trống'),
  client_secret: z.string().min(1, 'Client Secret không được để trống'),
  project_id: z.string().min(1, 'Project ID không được để trống'),
  auth_uri: z.string().url('Auth URI phải là một URL hợp lệ'),
  token_uri: z.string().url('Token URI phải là một URL hợp lệ'),
  redirect_uris: z
    .string()
    .min(1, 'Redirect URIs không được để trống')
    .refine(
      (val) =>
        val
          .split(',')
          .map((s) => s.trim())
          .every((s) => /^https?:\/\/.+/.test(s)),
      {
        message:
          'Mỗi Redirect URI phải là một URL hợp lệ (cách nhau bằng dấu phẩy)',
      },
    ),
  driveFolderId: z.string().min(1, 'Drive Folder ID không được để trống'),
})

export {
  createSchoolSchema,
  updateSchoolPricingPlanSchema,
  setSupportStaffSchema,
  updateStorageSizeSettingSchema,
  updateGoogleCredentialSchema,
}
