import { supabase } from '../lib/supabase'
import type { Profile, ProfileWithLocation, Role } from '../types'

export async function getMyProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export async function listUsers(): Promise<ProfileWithLocation[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, locations(name)')
    .order('full_name')
  if (error) throw error
  return data as unknown as ProfileWithLocation[]
}

export async function getUser(id: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error) throw error
  return data as Profile
}

export interface UserFormData {
  full_name: string
  username?: string
  role: Role
  location_id?: string
  active: boolean
}

export async function updateUser(id: string, v: UserFormData) {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: v.full_name,
      username: v.username || null,
      role: v.role,
      location_id: v.location_id || null,
      active: v.active,
    })
    .eq('id', id)
  if (error) throw error
}

export async function setUserActive(id: string, active: boolean) {
  const { error } = await supabase.from('profiles').update({ active }).eq('id', id)
  if (error) throw error
}