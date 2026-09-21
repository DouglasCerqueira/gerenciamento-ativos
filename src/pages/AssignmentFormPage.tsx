import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { assignmentSchema } from '../schemas/assignment'
import { createAssignment, listAssignableAssets, listEmployees } from '../services/assignments'
import type { AssetStock, Employee } from '../types'

type FormValues = {
  asset_id: string
  employee_id: string
  quantity: number
  notes?: string
}

const input =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const label = 'block text-sm font-medium text-slate-700'
const err = 'mt-1 block text-xs text-red-600'

export default function AssignmentFormPage() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<AssetStock[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(assignmentSchema) as unknown as Resolver<FormValues>,
    defaultValues: { asset_id: '', employee_id: '', quantity: 1, notes: '' },
  })

  useEffect(() => {
    Promise.all([listAssignableAssets(), listEmployees()])
      .then(([a, e]) => {
        setAssets(a)
        setEmployees(e)
      })
      .catch(console.error)
  }, [])

  const assetId = useWatch({ control, name: 'asset_id' })
  const selected = assets.find((a) => a.id === assetId)

  async function onSubmit(v: FormValues) {
    if (selected && v.quantity > selected.available) {
      setError('quantity', { message: `Máximo disponível: ${selected.available}` })
      return
    }
    try {
      await createAssignment(v.asset_id, v.employee_id, v.quantity, v.notes)
      navigate('/assignments')
    } catch (e) {
      setError('root', { message: (e as Error).message })
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/assignments" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Nova atribuição</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-sm">
        <label className={label}>
          Ativo
          <select className={input} {...register('asset_id')}>
            <option value="">Selecione...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.location_name} (disp. {a.available})
              </option>
            ))}
          </select>
          {errors.asset_id && <span className={err}>{errors.asset_id.message}</span>}
        </label>

        <label className={label}>
          Funcionário
          <select className={input} {...register('employee_id')}>
            <option value="">Selecione...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}{e.department ? ` (${e.department})` : ''}
              </option>
            ))}
          </select>
          {errors.employee_id && <span className={err}>{errors.employee_id.message}</span>}
        </label>

        <label className={label}>
          Quantidade
          <input type="number" min={1} max={selected?.available} className={input} {...register('quantity')} />
          {errors.quantity && <span className={err}>{errors.quantity.message}</span>}
        </label>

        <label className={label}>
          Observações
          <textarea rows={3} className={input} {...register('notes')} />
        </label>

        {errors.root && <p className="text-sm text-red-600">Erro: {errors.root.message}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/assignments" className="rounded-md border border-slate-300 px-4 py-2 text-sm">
            Cancelar
          </Link>
          <button
            disabled={isSubmitting}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : 'Atribuir'}
          </button>
        </div>
      </form>
    </div>
  )
}