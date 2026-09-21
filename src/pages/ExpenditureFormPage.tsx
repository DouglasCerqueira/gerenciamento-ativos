import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { expenditureSchema } from '../schemas/expenditure'
import { createExpenditure } from '../services/expenditures'
import { listAvailableAssets } from '../services/transfers'
import {
  EXPENDITURE_REASONS, REASON_LABEL,
  type AssetStock, type ExpenditureReason,
} from '../types'

type FormValues = {
  asset_id: string
  quantity: number
  reason: ExpenditureReason
  notes?: string
}

const input =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const label = 'block text-sm font-medium text-slate-700'
const err = 'mt-1 block text-xs text-red-600'

export default function ExpenditureFormPage() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<AssetStock[]>([])

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(expenditureSchema) as unknown as Resolver<FormValues>,
    defaultValues: { asset_id: '', quantity: 1, reason: 'descarte', notes: '' },
  })

  useEffect(() => {
    listAvailableAssets().then(setAssets).catch(console.error)
  }, [])

  const assetId = useWatch({ control, name: 'asset_id' })
  const selected = assets.find((a) => a.id === assetId)

  async function onSubmit(v: FormValues) {
    if (selected && v.quantity > selected.available) {
      setError('quantity', { message: `Máximo disponível: ${selected.available}` })
      return
    }
    try {
      await createExpenditure(v.asset_id, v.quantity, v.reason, v.notes)
      navigate('/expenditures')
    } catch (e) {
      setError('root', { message: (e as Error).message })
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/expenditures" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Nova baixa</h2>
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

        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Quantidade
            <input type="number" min={1} max={selected?.available} className={input} {...register('quantity')} />
            {errors.quantity && <span className={err}>{errors.quantity.message}</span>}
          </label>

          <label className={label}>
            Motivo
            <select className={input} {...register('reason')}>
              {EXPENDITURE_REASONS.map((r) => (
                <option key={r} value={r}>{REASON_LABEL[r]}</option>
              ))}
            </select>
          </label>
        </div>

        <label className={label}>
          Observações
          <textarea rows={3} className={input} {...register('notes')} />
        </label>

        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          A baixa é definitiva: as unidades saem do estoque e não voltam para a compra.
        </p>

        {errors.root && <p className="text-sm text-red-600">Erro: {errors.root.message}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/expenditures" className="rounded-md border border-slate-300 px-4 py-2 text-sm">
            Cancelar
          </Link>
          <button
            disabled={isSubmitting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar baixa'}
          </button>
        </div>
      </form>
    </div>
  )
}