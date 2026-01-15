import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().min(1, { message: 'Không được để trống' }),
  status: z.string().min(1, { message: 'Không được để trống' }),
  type: z.string().min(1, { message: 'Không được để trống' }),
})

const updateCategorySchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().min(1, { message: 'Không được để trống' }),
  status: z.string().min(1, { message: 'Không được để trống' }),
  type: z.string().min(1, { message: 'Không được để trống' }),
})

export { createCategorySchema, updateCategorySchema }
