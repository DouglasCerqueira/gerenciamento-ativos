import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

const input =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Ativos</h1>
      <p className="mt-2 text-sm text-slate-500">Entre na sua conta</p>

      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow">
        <label className="block text-sm font-medium text-slate-700">
          Login
          <input className={`${input} mt-1`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Senha
          <input className={`${input} mt-1`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-md bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-700">
          Entrar
        </button>
      </form>
    </div>
  )
}