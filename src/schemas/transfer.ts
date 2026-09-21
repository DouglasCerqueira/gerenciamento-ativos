import { z } from 'zod'

export const transferSchema = z.object({
  asset_id: z.string().min(1, 'Selecione o ativo'),
  to_location_id: z.string().min(1, 'Selecione o destino'),
  quantity: z.coerce.number().int().min(1, 'Mínimo 1'),
  notes: z.string().optional(),
})