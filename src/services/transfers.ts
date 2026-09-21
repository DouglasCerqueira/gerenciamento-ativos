import { supabase } from '../lib/supabase'
import type { AssetStock, Transfer } from '../types'

const SELECT =
  '*, from_location:locations!from_location_id(name), to_location:locations!to_location_id(name)'

export async function createTransfer(
  assetId: string,
  toLocationId: string,
  quantity: number,
  notes?: string
) {
  const { error } = await supabase.rpc('create_transfer', {
    p_asset_id: assetId,
    p_to_location_id: toLocationId,
    p_quantity: quantity,
    p_notes: notes || null,
  })
  if (error) throw error
}

export interface TransferFilters {
  page: number
  pageSize: number
  search: string
  fromId: string
  toId: string
}

export async function listTransfers(f: TransferFilters) {
  let q = supabase.from('transfers').select(SELECT, { count: 'exact' })
  if (f.search) q = q.ilike('asset_name', `%${f.search}%`)
  if (f.fromId) q = q.eq('from_location_id', f.fromId)
  if (f.toId) q = q.eq('to_location_id', f.toId)

  const from = (f.page - 1) * f.pageSize
  const { data, error, count } = await q
    .order('created_at', { ascending: false })
    .range(from, from + f.pageSize - 1)
  if (error) throw error
  return { data: data as unknown as Transfer[], count: count ?? 0 }
}

export async function getTransfer(id: string): Promise<Transfer> {
  const { data, error } = await supabase.from('transfers').select(SELECT).eq('id', id).single()
  if (error) throw error
  return data as unknown as Transfer
}

export async function listAvailableAssets(): Promise<AssetStock[]> {
  const { data, error } = await supabase
    .from('assets_stock')
    .select('*')
    .gt('available', 0)
    .order('name')
  if (error) throw error
  return data as AssetStock[]
}