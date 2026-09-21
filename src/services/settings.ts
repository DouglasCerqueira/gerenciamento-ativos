import { supabase } from '../lib/supabase'

type Messages = { unique?: string; fk?: string }

function friendly(error: { code?: string; message: string }, m: Messages) {
  if (error.code === '23505' && m.unique) return new Error(m.unique)
  if (error.code === '23503' && m.fk) return new Error(m.fk)
  return new Error(error.message)
}

const LOCATION_MSG: Messages = {
  unique: 'Já existe um local com esse nome.',
  fk: 'Este local está em uso (ativos, compras ou usuários) e não pode ser excluído.',
}

const EMPLOYEE_MSG: Messages = {
  unique: 'Já existe um funcionário com esse email.',
  fk: 'Este funcionário tem atribuições registradas e não pode ser excluído.',
}

export async function createLocation(name: string) {
  const { error } = await supabase.from('locations').insert({ name })
  if (error) throw friendly(error, LOCATION_MSG)
}

export async function updateLocation(id: string, name: string) {
  const { error } = await supabase.from('locations').update({ name }).eq('id', id)
  if (error) throw friendly(error, LOCATION_MSG)
}

export async function deleteLocation(id: string) {
  const { error } = await supabase.from('locations').delete().eq('id', id)
  if (error) throw friendly(error, LOCATION_MSG)
}

export interface EmployeeInput {
  name: string
  email: string
  department?: string
}

export async function createEmployee(v: EmployeeInput) {
  const { error } = await supabase
    .from('employees')
    .insert({ name: v.name, email: v.email, department: v.department || null })
  if (error) throw friendly(error, EMPLOYEE_MSG)
}

export async function updateEmployee(id: string, v: EmployeeInput) {
  const { error } = await supabase
    .from('employees')
    .update({ name: v.name, email: v.email, department: v.department || null })
    .eq('id', id)
  if (error) throw friendly(error, EMPLOYEE_MSG)
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) throw friendly(error, EMPLOYEE_MSG)
}