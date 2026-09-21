import { supabase } from '../lib/supabase'
import type { AssetFormData } from '../schemas/asset'
import type { Asset, AssetStatus, AssetStock, AssetType } from '../types'

export async function createAsset(data: AssetFormData) {
  const payload: Record<string, unknown> = { ...data }
  const { error } = await supabase.from('assets').insert(payload)
  if (error) throw error
}

export async function updateAsset(id: string, data: AssetFormData) {
  const payload: Record<string, unknown> = { ...data }
  delete payload.purchase_id
  const { error } = await supabase.from('assets').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteAsset(id: string) {
  const { error } = await supabase.from('assets').delete().eq('id', id)
  if (error) throw error
}

export async function getAsset(id: string): Promise<AssetStock> {
  const { data, error } = await supabase.from('assets_stock').select('*').eq('id', id).single()
  if (error) throw error
  return data as AssetStock
}

export interface AssetFilters {
  page: number
  pageSize: number
  search: string
  type: AssetType | ''
  locationId: string
  status: AssetStatus | ''
}

export async function listAssetsStock(f: AssetFilters) {
  let q = supabase.from('assets_stock').select('*', { count: 'exact' }).gt('quantity', 0)
  if (f.search) q = q.ilike('name', `%${f.search}%`)
  if (f.type) q = q.eq('type', f.type)
  if (f.locationId) q = q.eq('location_id', f.locationId)
  if (f.status) q = q.eq('status', f.status)

  const from = (f.page - 1) * f.pageSize
  const { data, error, count } = await q.order('name').range(from, from + f.pageSize - 1)
  if (error) throw error
  return { data: data as AssetStock[], count: count ?? 0 }
}

export async function listAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Asset[]
}

export async function updateAssetStatus(id: string, status: AssetStatus) {
  const { error } = await supabase.from('assets').update({ status }).eq('id', id)
  if (error) throw error
}
