import { z } from 'zod'
import { ROLES } from '../types'

export const userSchema = z.object({
  full_name: z.string().min(2, 'Nome muito curto'),
  username: z.string().optional(),
  role: z.enum(ROLES),
  location_id: z.string().optional(),
  active: z.boolean(),
})