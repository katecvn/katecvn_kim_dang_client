import { z } from 'zod'

const createPurchaseOrderSchema = z.object({
  supplierId: z.string().nonempty('Nhà cung cấp là bắt buộc'),
  orderDate: z.date({
    required_error: 'Ngày đặt hàng là bắt buộc',
  }),
  expectedDeliveryDate: z.date().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
  paymentTerms: z.string().max(500).nullable().optional(),
  status: z.string().nonempty('Trạng thái là bắt buộc'),
  paymentMethod: z.string().nonempty('Bắt buộc'),
  paymentNote: z.string().max(190, 'Tối đa 190 ký tự'),
  bankAccount: z.any().nullable(),
  isAutoApprove: z.boolean().default(true).optional(),
})

const updatePurchaseOrderSchema = z.object({
  supplierId: z.string().nonempty('Nhà cung cấp là bắt buộc'),
  expectedDeliveryDate: z.string().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
  paymentTerms: z.string().max(500).nullable().optional(),
  paymentMethod: z.string().nonempty('Bắt buộc'),
  paymentNote: z.string().max(190, 'Tối đa 190 ký tự'),
  bankAccount: z.any().nullable(),
})

export { createPurchaseOrderSchema, updatePurchaseOrderSchema }
