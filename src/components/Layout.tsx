import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Package, Truck, ShoppingCart,
  UserCheck, Archive, Users, Settings, LogOut,
  type LucideIcon,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ALL_ROLES, can, useProfile } from '../lib/roles'
import { ROLE_LABEL, type Role } from '../types'

const links: { to: string; label: string; icon: LucideIcon; roles: Role[] }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
  { to: '/assets', label: 'Ativos', icon: Package, roles: ALL_ROLES },
  { to: '/transfers', label: 'Transferências', icon: Truck, roles: ALL_ROLES },
  { to: '/purchases', label: 'Compras', icon: ShoppingCart, roles: ALL_ROLES },
  { to: '/assignments', label: 'Atribuições', icon: UserCheck, roles: ALL_ROLES },
  { to: '/expenditures', label: 'Baixas', icon: Archive, roles: ALL_ROLES },
  { to: '/users', label: 'Usuários', icon: Users, roles: ['admin'] },
  { to: '/settings', label: 'Configurações', icon: Settings, roles: ['admin'] },
]

export default function Layout() {
  const profile = useProfile()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-white">
        <h1 className="px-4 py-5 text-lg font-bold leading-tight">
          Gerenciamento<br />de Ativos
        </h1>
        <nav className="flex flex-col gap-1 px-2">
          {links
            .filter((l) => can(profile?.role, l.roles))
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white px-6">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">{profile && ROLE_LABEL[profile.role]}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
            {profile?.full_name[0]?.toUpperCase()}
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            title="Sair"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}