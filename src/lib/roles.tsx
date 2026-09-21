/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Profile, Role } from '../types'

export const ALL_ROLES: Role[] = ['admin', 'gestor', 'tecnico']
export const MANAGERS: Role[] = ['admin', 'gestor']

export const ProfileContext = createContext<Profile | null>(null)
export const useProfile = () => useContext(ProfileContext)

export const can = (role: Role | undefined, allowed: Role[]) =>
  !!role && allowed.includes(role)

export function Can({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const profile = useProfile()
  return can(profile?.role, roles) ? <>{children}</> : null
}

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const profile = useProfile()
  return can(profile?.role, roles) ? <>{children}</> : <Navigate to="/" replace />
}