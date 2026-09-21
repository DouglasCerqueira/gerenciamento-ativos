import { z } from 'zod'

export const assignmentSchema = z.object({
  asset_id: z.string().min(1, 'Selecione o ativo'),
  employee_id: z.string().min(1, 'Selecione o funcionário'),
  quantity: z.coerce.number().int().min(1, 'Mínimo 1'),
  notes: z.string().optional(),
})