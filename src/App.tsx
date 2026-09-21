import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { MANAGERS, ProfileContext, RequireRole } from './lib/roles'
import { getMyProfile } from './services/users'
import type { Profile } from './types'
import Login from './components/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import AssetDetail from './pages/AssetDetail'
import AssetFormPage from './pages/AssetFormPage'
import Transfers from './pages/Transfers'
import TransferDetail from './pages/TransferDetail'
import TransferFormPage from './pages/TransferFormPage'
import Purchases from './pages/Purchases'
import PurchaseDetail from './pages/PurchaseDetail'
import PurchaseFormPage from './pages/PurchaseFormPage'
import Assignments from './pages/Assignments'
import AssignmentDetail from './pages/AssignmentDetail'
import AssignmentFormPage from './pages/AssignmentFormPage'
import Expenditures from './pages/Expenditures'
import ExpenditureDetail from './pages/ExpenditureDetail'
import ExpenditureFormPage from './pages/ExpenditureFormPage'
import Users from './pages/Users'
import UserFormPage from './pages/UserFormPage'
import Settings from './pages/Settings'

const ADMIN = ['admin'] as const

function Blocked() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Acesso indisponível</h1>
      <p className="text-sm text-slate-500">
        Seu usuário não tem um perfil ativo. Fale com um administrador.
      </p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
      >
        Sair
      </button>
    </div>
  )
}

function Authenticated({ session }: { session: Session }) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)

  useEffect(() => {
    getMyProfile(session.user.id)
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [session.user.id])

  if (profile === undefined) return null
  if (!profile || !profile.active) return <Blocked />

  return (
    <ProfileContext.Provider value={profile}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="assets/new" element={<RequireRole roles={MANAGERS}><AssetFormPage /></RequireRole>} />
            <Route path="assets/:id" element={<AssetDetail />} />
            <Route path="assets/:id/edit" element={<RequireRole roles={MANAGERS}><AssetFormPage /></RequireRole>} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="transfers/new" element={<RequireRole roles={MANAGERS}><TransferFormPage /></RequireRole>} />
            <Route path="transfers/:id" element={<TransferDetail />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="purchases/new" element={<RequireRole roles={MANAGERS}><PurchaseFormPage /></RequireRole>} />
            <Route path="purchases/:id" element={<PurchaseDetail />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/new" element={<AssignmentFormPage />} />
            <Route path="assignments/:id" element={<AssignmentDetail />} />
            <Route path="expenditures" element={<Expenditures />} />
            <Route path="expenditures/new" element={<RequireRole roles={MANAGERS}><ExpenditureFormPage /></RequireRole>} />
            <Route path="expenditures/:id" element={<ExpenditureDetail />} />
            <Route path="users" element={<RequireRole roles={[...ADMIN]}><Users /></RequireRole>} />
            <Route path="users/:id/edit" element={<RequireRole roles={[...ADMIN]}><UserFormPage /></RequireRole>} />
            <Route path="settings" element={<RequireRole roles={[...ADMIN]}><Settings /></RequireRole>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProfileContext.Provider>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return null
  if (!session) return <Login />

  return <Authenticated key={session.user.id} session={session} />
}