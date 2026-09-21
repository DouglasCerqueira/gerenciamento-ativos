import { z } from 'zod'
import { EXPENDITURE_REASONS } from '../types'

export const expenditureSchema = z.object({
  asset_id: z.string().min(1, 'Selecione o ativo'),
  quantity: z.coerce.number().int().min(1, 'Mínimo 1'),
  reason: z.enum(EXPENDITURE_REASONS),
  notes: z.string().optional(),
})