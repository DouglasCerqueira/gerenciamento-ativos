import { supabase } from '../lib/supabase'
import type { AssetStock, AssignmentDetail, Employee } from '../types'

const SELECT = '*, assets(name, type, locations(name)), employees(name, department)'

export async function listEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from('employees').select('*').order('name')
  if (error) throw error
  return data as Employee[]
}

// ativos com unidades disponíveis e fora de manutenção
export async function listAssignableAssets(): Promise<AssetStock[]> {
  const { data, error } = await supabase
    .from('assets_stock')
    .select('*')
    .gt('available', 0)
    .neq('status', 'manutencao')
    .order('name')
  if (error) throw error
  return data as AssetStock[]
}

export async function createAssignment(
  assetId: string,
  employeeId: string,
  quantity: number,
  notes?: string
) {
  const { error } = await supabase.rpc('create_assignment', {
    p_asset_id: assetId,
    p_employee_id: employeeId,
    p_quantity: quantity,
    p_notes: notes || null,
  })
  if (error) throw error
}

export async function returnAssignment(id: string) {
  const { error } = await supabase.rpc('return_assignment', { p_assignment_id: id })
  if (error) throw error
}

export interface AssignmentFilters {
  page: number
  pageSize: number
  employeeId: string
  status: 'ativa' | 'devolvida' | ''
}

export async function listAssignments(f: AssignmentFilters) {
  let q = supabase.from('assignments').select(SELECT, { count: 'exact' })
  if (f.employeeId) q = q.eq('employee_id', f.employeeId)
  if (f.status === 'ativa') q = q.is('returned_at', null)
  if (f.status === 'devolvida') q = q.not('returned_at', 'is', null)

  const from = (f.page - 1) * f.pageSize
  const { data, error, count } = await q
    .order('assigned_at', { ascending: false })
    .range(from, from + f.pageSize - 1)
  if (error) throw error
  return { data: data as unknown as AssignmentDetail[], count: count ?? 0 }
}

export async function getAssignment(id: string): Promise<AssignmentDetail> {
  const { data, error } = await supabase.from('assignments').select(SELECT).eq('id', id).single()
  if (error) throw error
  return data as unknown as AssignmentDetail
}