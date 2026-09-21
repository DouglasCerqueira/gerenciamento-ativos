import { supabase } from '../lib/supabase'
import type { AssetType, PurchaseStatus, PurchaseStock } from '../types'

export interface PurchaseFormData {
  item_name: string
  asset_type: AssetType
  location_id: string
  supplier: string
  quantity: number
  unit_cost: number
  invoice_number?: string
  notes?: string
}

export async function createPurchase(d: PurchaseFormData) {
  const payload = { ...d, invoice_number: d.invoice_number || null, notes: d.notes || null }
  const { error } = await supabase.from('purchases').insert(payload)
  if (error) throw error
}

export interface PurchaseFilters {
  page: number
  pageSize: number
  search: string
  status: PurchaseStatus | ''
  locationId: string
}

export async function listPurchases(f: PurchaseFilters) {
  let q = supabase.from('purchases_stock').select('*', { count: 'exact' })
  if (f.search) q = q.ilike('item_name', `%${f.search}%`)
  if (f.status) q = q.eq('status', f.status)
  if (f.locationId) q = q.eq('location_id', f.locationId)

  const from = (f.page - 1) * f.pageSize
  const { data, error, count } = await q
    .order('purchased_at', { ascending: false })
    .range(from, from + f.pageSize - 1)
  if (error) throw error
  return { data: data as PurchaseStock[], count: count ?? 0 }
}

export async function getPurchase(id: string): Promise<PurchaseStock> {
  const { data, error } = await supabase.from('purchases_stock').select('*').eq('id', id).single()
  if (error) throw error
  return data as PurchaseStock
}

// compras entregues que ainda têm estoque para cadastrar ativos
export async function listStockPurchases(): Promise<PurchaseStock[]> {
  const { data, error } = await supabase
    .from('purchases_stock')
    .select('*')
    .gt('remaining', 0)
    .order('purchased_at', { ascending: false })
  if (error) throw error
  return data as PurchaseStock[]
}

export async function markDelivered(id: string) {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'entregue', delivered_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pedido')
  if (error) throw error
}

export async function cancelPurchase(id: string) {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'cancelado' })
    .eq('id', id)
    .eq('status', 'pedido')
  if (error) throw error
}