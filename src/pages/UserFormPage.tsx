import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { userSchema } from '../schemas/user'
import { getUser, updateUser } from '../services/users'
import { listLocations } from '../services/locations'
import { ROLES, ROLE_LABEL, type AssetLocation, type Profile, type Role } from '../types'

type FormValues = {
  full_name: string
  username?: string
  role: Role
  location_id?: string
  active: boolean
}

const input =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const label = 'block text-sm font-medium text-slate-700'
const err = 'mt-1 block text-xs text-red-600'

function UserForm({ user, locations }: { user: Profile; locations: AssetLocation[] }) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(userSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      full_name: user.full_name,
      username: user.username ?? '',
      role: user.role,
      location_id: user.location_id ?? '',
      active: user.active,
    },
  })

  async function onSubmit(v: FormValues) {
    try {
      await updateUser(user.id, v)
      navigate('/users')
    } catch (e) {
      setError('root', { message: (e as Error).message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-sm">
      <div>
        <span className={label}>Email</span>
        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
      </div>

      <label className={label}>
        Nome completo
        <input className={input} {...register('full_name')} />
        {errors.full_name && <span className={err}>{errors.full_name.message}</span>}
      </label>

      <label className={label}>
        Usuário
        <input className={input} {...register('username')} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={label}>
          Perfil
          <select className={input} {...register('role')}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
        </label>

        <label className={label}>
          Local
          <select className={input} {...register('location_id')}>
            <option value="">N/A</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" {...register('active')} />
        Usuário ativo
      </label>

      {errors.root && <p className="text-sm text-red-600">Erro: {errors.root.message}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Link to="/users" className="rounded-md border border-slate-300 px-4 py-2 text-sm">
          Cancelar
        </Link>
        <button
          disabled={isSubmitting}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

export default function UserFormPage() {
  const { id } = useParams()
  const [user, setUser] = useState<Profile>()
  const [locations, setLocations] = useState<AssetLocation[]>()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([getUser(id), listLocations()])
      .then(([u, l]) => {
        setUser(u)
        setLocations(l)
      })
      .catch((e: Error) => setError(e.message))
  }, [id])

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/users" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Editar usuário</h2>
      </div>

      {error && <p className="text-sm text-red-600">Erro: {error}</p>}
      {user && locations && <UserForm key={user.id} user={user} locations={locations} />}
    </div>
  )
}