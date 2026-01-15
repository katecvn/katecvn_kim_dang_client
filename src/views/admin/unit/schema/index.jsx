import { z } from 'zod'

const createUnitSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
})

const updateUnitSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
})

export { createUnitSchema, updateUnitSchema }
