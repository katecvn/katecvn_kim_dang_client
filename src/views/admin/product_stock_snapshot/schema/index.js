import { z } from 'zod'

export const updateProductStockSnapshotSchema = z.object({
  productCode: z.string().min(1, 'Vui lòng nhập mã hàng').trim(),

  serialNumber: z.string().optional().nullable(),

  productName: z.string().min(1, 'Vui lòng nhập tên hàng hóa').trim(),

  unitName: z.string().min(1, 'Vui lòng nhập đơn vị tính').trim(),

  quantity: z
    .number({ invalid_type_error: 'Số lượng phải là số' })
    .int('Số lượng phải là số nguyên')
    .min(0, 'Số lượng không được âm'),

  price: z
    .number({ invalid_type_error: 'Giá tồn phải là số' })
    .min(0, 'Giá tồn không được âm'),

  snapshotDate: z
    .string()
    .min(1, 'Vui lòng chọn ngày chốt')
    .refine((date) => {
      // Kiểm tra định dạng yyyy-mm-dd
      return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date))
    }, 'Ngày chốt không hợp lệ'),

  note: z.string().optional().nullable(),
})
