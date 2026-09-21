import { z } from 'zod'
import { ASSET_STATUS } from '../types'

const base = {
  name: z.string().min(2, 'Nome muito curto'),
  status: z.enum(ASSET_STATUS),
  location_id: z.string().uuid('Selecione o local'),
  quantity: z.coerce.number().int().min(1, 'Mínimo 1'),
  purchase_id: z.string().optional(),
}

const hardware = <T extends 'computador' | 'roteador' | 'impressora'>(type: T) =>
  z.object({
    ...base,
    type: z.literal(type),
    serial_number: z.string().min(3, 'Informe o nº de série'),
  })

const license = z.object({
  ...base,
  type: z.literal('licenca'),
  license_key: z.string().min(5, 'Informe a chave da licença'),
  expires_at: z.string().min(1, 'Informe a validade'),
})

export const assetSchema = z.discriminatedUnion('type', [
  hardware('computador'),
  hardware('roteador'),
  hardware('impressora'),
  license,
])

export type AssetFormData = z.infer<typeof assetSchema>