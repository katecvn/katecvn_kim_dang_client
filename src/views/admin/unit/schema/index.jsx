import { z } from 'zod'

const createUnitSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().optional(),
})

const updateUnitSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().optional(),
})

export { createUnitSchema, updateUnitSchema }
