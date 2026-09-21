import { z } from 'zod'

export const locationSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
})

export const employeeSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
  email: z.string().trim().email('Email inválido'),
  department: z.string().trim().optional(),
})