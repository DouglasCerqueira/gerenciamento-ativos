import { supabase } from '../lib/supabase'
import type { Expenditure, ExpenditureReason } from '../types'

const SELECT = '*, locations(name)'

export async function createExpenditure(
  assetId: string,
  quantity: number,
  reason: ExpenditureReason,
  notes?: string
) {
  const { error } = await supabase.rpc('create_expenditure', {
    p_asset_id: assetId,
    p_quantity: quantity,
    p_reason: reason,
    p_notes: notes || null,
  })
  if (error) throw error
}

export interface ExpenditureFilters {
  page: number
  pageSize: number
  search: string
  reason: ExpenditureReason | ''
  locationId: string
}

export async function listExpenditures(f: ExpenditureFilters) {
  let q = supabase.from('expenditures').select(SELECT, { count: 'exact' })
  if (f.search) q = q.ilike('asset_name', `%${f.search}%`)
  if (f.reason) q = q.eq('reason', f.reason)
  if (f.locationId) q = q.eq('location_id', f.locationId)

  const from = (f.page - 1) * f.pageSize
  const { data, error, count } = await q
    .order('created_at', { ascending: false })
    .range(from, from + f.pageSize - 1)
  if (error) throw error
  return { data: data as unknown as Expenditure[], count: count ?? 0 }
}

export async function getExpenditure(id: string): Promise<Expenditure> {
  const { data, error } = await supabase.from('expenditures').select(SELECT).eq('id', id).single()
  if (error) throw error
  return data as unknown as Expenditure
}