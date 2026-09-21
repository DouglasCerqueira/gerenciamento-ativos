import { supabase } from '../lib/supabase'
import type { AssetStock, AssetType } from '../types'

export interface DashboardFilters {
  locationId: string
  type: AssetType | ''
  from: string // yyyy-mm-dd
  to: string
}

const start = (d: string) => new Date(`${d}T00:00:00`).toISOString()
const end = (d: string) => new Date(`${d}T23:59:59.999`).toISOString()

export async function getDashboardAssets(f: DashboardFilters): Promise<AssetStock[]> {
  let q = supabase.from('assets_stock').select('*').gt('quantity', 0)
  if (f.locationId) q = q.eq('location_id', f.locationId)
  if (f.type) q = q.eq('type', f.type)
  if (f.from) q = q.gte('created_at', start(f.from))
  if (f.to) q = q.lte('created_at', end(f.to))

  const { data, error } = await q
  if (error) throw error
  return data as AssetStock[]
}

// total de unidades baixadas no período/filtros
export async function getExpendedTotal(f: DashboardFilters): Promise<number> {
  let q = supabase.from('expenditures').select('quantity')
  if (f.locationId) q = q.eq('location_id', f.locationId)
  if (f.type) q = q.eq('asset_type', f.type)
  if (f.from) q = q.gte('created_at', start(f.from))
  if (f.to) q = q.lte('created_at', end(f.to))

  const { data, error } = await q
  if (error) throw error
  return (data ?? []).reduce((s, r) => s + Number(r.quantity), 0)
}