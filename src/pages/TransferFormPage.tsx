import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { transferSchema } from '../schemas/transfer'
import { createTransfer, listAvailableAssets } from '../services/transfers'
import { listLocations } from '../services/locations'
import type { AssetStock, AssetLocation } from '../types'

type FormValues = {
  asset_id: string
  to_location_id: string
  quantity: number
  notes?: string
}

const input =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const label = 'block text-sm font-medium text-slate-700'
const err = 'mt-1 block text-xs text-red-600'

export default function TransferFormPage() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<AssetStock[]>([])
  const [locations, setLocations] = useState<AssetLocation[]>([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(transferSchema) as unknown as Resolver<FormValues>,
    defaultValues: { asset_id: '', to_location_id: '', quantity: 1, notes: '' },
  })

  useEffect(() => {
    Promise.all([listAvailableAssets(), listLocations()])
      .then(([a, l]) => {
        setAssets(a)
        setLocations(l)
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
      await createTransfer(v.asset_id, v.to_location_id, v.quantity, v.notes)
      navigate('/transfers')
    } catch (e) {
      setError('root', { message: (e as Error).message })
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/transfers" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Nova transferência</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-sm">
        <label className={label}>
          Ativo
          <select
            className={input}
            {...register('asset_id', { onChange: () => setValue('to_location_id', '') })}
          >
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
          Local de destino
          <select className={input} {...register('to_location_id')}>
            <option value="">Selecione...</option>
            {locations
              .filter((l) => l.id !== selected?.location_id)
              .map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
          </select>
          {errors.to_location_id && <span className={err}>{errors.to_location_id.message}</span>}
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
          <Link to="/transfers" className="rounded-md border border-slate-300 px-4 py-2 text-sm">
            Cancelar
          </Link>
          <button
            disabled={isSubmitting}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Transferindo...' : 'Transferir'}
          </button>
        </div>
      </form>
    </div>
  )
}