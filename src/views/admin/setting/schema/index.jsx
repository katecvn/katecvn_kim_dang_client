import { z } from 'zod'

const setSharingRatioSchema = z.object({
  sharingRatios: z
    .array(
      z.object({
        main: z.coerce
          .number({ message: 'Phải là số' })
          .min(0, 'Tỉ lệ người chính phải lớn hơn hoặc bằng 0')
          .max(10, 'Tỉ lệ người chính phải nhỏ hơn hoặc bằng 10'),
        sub: z.coerce
          .number({ message: 'Phải là số' })
          .min(0, 'Tỉ lệ người phụ phải lớn hơn hoặc bằng 0')
          .max(10, 'Tỉ lệ người phụ phải nhỏ hơn hoặc bằng 10'),
      }),
    )
    .superRefine((sharingRatios, ctx) => {
      sharingRatios.forEach(({ main, sub }, index) => {
        if (main + sub !== 10) {
          ctx.addIssue({
            path: [index, 'sub'],
            message: 'Tổng phải là 10',
          })
        }
      })
    }),
})

const updateGeneralSettingSchema = z.object({
  generalSetting: z.object({
    brandName: z.string().min(1, 'Tên công ty không được để trống'),
    logo: z.string().optional().nullable(),
    name: z.string().min(1, 'Tên website không được để trống'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(1, 'Số điện thoại không được để trống'),
    address: z.string().min(1, 'Địa chỉ không được để trống'),
    taxCode: z.string().min(1, 'Mã số thuế không được để trống'),
    website: z.string().min(1, 'Địa chỉ website không được để trống'),
    banks: z
      .array(
        z.object({
          accountNumber: z.string().min(1, 'Số tài khoản không được để trống'),
          accountName: z.string().min(1, 'Tên tài khoản không được để trống'),
          bankName: z.string().min(1, 'Tên ngân hàng không được để trống'),
          bankBranch: z.string().min(1, 'Chi nhánh không được để trống'),
        }),
      )
      .min(1, 'Phải có ít nhất một tài khoản ngân hàng'),
  }),
})

const updateSInvoiceSettingSchema = z.object({
  generalSetting: z.object({
    username: z.string().min(1, 'Vui lòng nhập tài khoản'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
    templateCode: z
      .string()
      .min(1, 'Vui lòng nhập mẫu số hóa đơn (templateCode)'),
    invoiceSeries: z
      .string()
      .min(1, 'Vui lòng nhập ký hiệu hóa đơn (invoiceSeries)'),
    invoiceType: z.string().min(1, 'Vui lòng nhập loại hóa đơn (invoiceType)'),
    currencyCode: z
      .string()
      .min(1, 'Vui lòng nhập đơn vị tiền tệ (currencyCode)'),
  }),
})

export {
  setSharingRatioSchema,
  updateGeneralSettingSchema,
  updateSInvoiceSettingSchema,
}
