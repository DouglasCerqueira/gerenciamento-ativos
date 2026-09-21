import { z } from 'zod'
import { ASSET_TYPES } from '../types'

export const purchaseSchema = z.object({
  item_name: z.string().min(2, 'Nome muito curto'),
  asset_type: z.enum(ASSET_TYPES),
  location_id: z.string().min(1, 'Selecione o local'),
  supplier: z.string().min(2, 'Informe o fornecedor'),
  quantity: z.coerce.number().int().min(1, 'Mínimo 1'),
  unit_cost: z.coerce.number().positive('Informe o valor unitário'),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
})