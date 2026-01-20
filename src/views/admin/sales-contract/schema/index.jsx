import { z } from 'zod'

const createSalesContractSchema = z.object({
  contractNumber: z.string().min(1, 'Số hợp đồng không được để trống'),
  contractDate: z.string().min(1, 'Ngày ký hợp đồng không được để trống'),
  deliveryDate: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
})

export { createSalesContractSchema }
