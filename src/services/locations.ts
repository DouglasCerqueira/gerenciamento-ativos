import { supabase } from '../lib/supabase'
import type { AssetLocation } from '../types'

export async function listLocations(): Promise<AssetLocation[]> {
  const { data, error } = await supabase.from('locations').select('*').order('name')
  if (error) throw error
  return data as AssetLocation[]
}