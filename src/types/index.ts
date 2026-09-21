export const ASSET_TYPES = ['computador', 'roteador', 'impressora', 'licenca'] as const
export const ASSET_STATUS = ['em_uso', 'manutencao', 'disponivel'] as const

export type AssetType = (typeof ASSET_TYPES)[number]
export type AssetStatus = (typeof ASSET_STATUS)[number]

export interface Employee {
  id: string
  name: string
  email: string
  department: string | null
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  status: AssetStatus
  serial_number: string | null
  license_key: string | null
  expires_at: string | null
  location_id: string
  quantity: number
  created_at: string
  purchase_id: string | null
}

export interface Transfer {
  id: string
  asset_id: string | null
  asset_name: string
  asset_type: AssetType
  from_location_id: string
  to_location_id: string
  quantity: number
  notes: string | null
  transferred_by: string | null
  created_at: string
  from_location: { name: string } | null
  to_location: { name: string } | null
}

export interface AssetLocation {
  id: string
  name: string
}

export interface AssetStock extends Asset {
  location_name: string
  assigned: number
  available: number
}

export interface Assignment {
  id: string
  asset_id: string
  employee_id: string
  quantity: number
  assigned_at: string
  returned_at: string | null
  notes: string | null
  assigned_by: string | null
}

export const STATUS_LABEL: Record<AssetStatus, string> = {
  em_uso: 'Em uso',
  manutencao: 'Manutenção',
  disponivel: 'Disponível',
}

export interface AssignmentDetail extends Assignment {
  assets: { name: string; type: AssetType; locations: { name: string } | null } | null
  employees: { name: string; department: string | null } | null
}

export const TYPE_LABEL: Record<AssetType, string> = {
  computador: 'Computador',
  roteador: 'Roteador',
  impressora: 'Impressora',
  licenca: 'Licença',
}

export const PURCHASE_STATUS = ['pedido', 'entregue', 'cancelado'] as const
export type PurchaseStatus = (typeof PURCHASE_STATUS)[number]

export const PURCHASE_STATUS_LABEL: Record<PurchaseStatus, string> = {
  pedido: 'Pedido',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

export interface Purchase {
  id: string
  item_name: string
  asset_type: AssetType
  location_id: string
  supplier: string
  quantity: number
  unit_cost: number
  total_cost: number
  invoice_number: string | null
  status: PurchaseStatus
  notes: string | null
  purchased_by: string | null
  purchased_at: string
  delivered_at: string | null
  created_at: string
}

export interface PurchaseStock extends Purchase {
  location_name: string
  registered: number
  remaining: number
}

export const EXPENDITURE_REASONS = ['descarte', 'perda', 'roubo', 'dano', 'obsolescencia'] as const
export type ExpenditureReason = (typeof EXPENDITURE_REASONS)[number]

export const REASON_LABEL: Record<ExpenditureReason, string> = {
  descarte: 'Descarte',
  perda: 'Perda',
  roubo: 'Roubo/Furto',
  dano: 'Dano irreparável',
  obsolescencia: 'Obsolescência',
}

export interface Expenditure {
  id: string
  asset_id: string | null
  asset_name: string
  asset_type: AssetType
  location_id: string
  purchase_id: string | null
  quantity: number
  reason: ExpenditureReason
  notes: string | null
  registered_by: string | null
  created_at: string
  locations: { name: string } | null
}

export const ROLES = ['admin', 'gestor', 'tecnico'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  tecnico: 'Técnico',
}

export interface Profile {
  id: string
  email: string
  full_name: string
  username: string | null
  role: Role
  location_id: string | null
  active: boolean
  created_at: string
}

export interface ProfileWithLocation extends Profile {
  locations: { name: string } | null
}