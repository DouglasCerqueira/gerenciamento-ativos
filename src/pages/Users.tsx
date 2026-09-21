import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listUsers, setUserActive } from '../services/users'
import ConfirmDialog from '../components/ConfirmDialog'
import { useProfile } from '../lib/roles'
import { ROLE_LABEL, type ProfileWithLocation, type Role } from '../types'

const roleColors: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-800',
  gestor: 'bg-blue-100 text-blue-800',
  tecnico: 'bg-green-100 text-green-800',
}

export default function Users() {
  const me = useProfile()
  const [rows, setRows] = useState<ProfileWithLocation[]>([])
  const [target, setTarget] = useState<ProfileWithLocation | null>(null)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listUsers()
      .then((data) => {
        setRows(data)
        setError('')
      })
      .catch((e: Error) => setError(e.message))
  }, [reload])

  async function confirm() {
    if (!target) return
    try {
      await setUserActive(target.id, !target.active)
      setReload((r) => r + 1)
    } catch (e) {
      setError((e as Error).message)
    }
    setTarget(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Usuários</h2>

      <p className="mt-4 rounded-md bg-sky-50 p-3 text-sm text-sky-800">
        Para adicionar um usuário, crie-o no painel do Supabase (Authentication &gt; Users &gt; Add
        user). Ele aparece aqui como Técnico, e você define o perfil e o local.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">Erro: {error}</p>}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Usuário</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Perfil</th>
                <th className="px-6 py-3">Local</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{u.full_name}</td>
                  <td className="px-6 py-4 text-slate-600">{u.username}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[u.role]}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{u.locations?.name ?? 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="space-x-4 whitespace-nowrap px-6 py-4 text-right">
                    <Link to={`/users/${u.id}/edit`} className="text-blue-800 hover:underline">
                      Editar
                    </Link>
                    {u.id !== me?.id && (
                      <button
                        onClick={() => setTarget(u)}
                        className={u.active ? 'text-red-600 hover:underline' : 'text-green-700 hover:underline'}
                      >
                        {u.active ? 'Desativar' : 'Ativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!target}
        danger={!!target?.active}
        title={target?.active ? 'Desativar usuário' : 'Ativar usuário'}
        message={
          target?.active
            ? `Desativar ${target?.full_name}? Ele perde o acesso ao sistema.`
            : `Reativar o acesso de ${target?.full_name}?`
        }
        confirmLabel={target?.active ? 'Desativar' : 'Ativar'}
        onConfirm={confirm}
        onCancel={() => setTarget(null)}
      />
    </div>
  )
}