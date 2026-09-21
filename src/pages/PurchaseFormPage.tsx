import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { purchaseSchema } from '../schemas/purchase'
import { createPurchase } from '../services/purchases'
import { listLocations } from '../services/locations'
import { brl } from '../lib/format'
import { ASSET_TYPES, TYPE_LABEL, type AssetType, type AssetLocation } from '../types'

type FormValues = {
  item_name: string
  asset_type: AssetType
  location_id: string
  supplier: string
  quantity: number
  unit_cost: number
  invoice_number?: string
  notes?: string
}

const input =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const label = 'block text-sm font-medium text-slate-700'
const err = 'mt-1 block text-xs text-red-600'

export default function PurchaseFormPage() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<AssetLocation[]>([])

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(purchaseSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      item_name: '',
      asset_type: 'computador',
      location_id: '',
      supplier: '',
      quantity: 1,
      invoice_number: '',
      notes: '',
    },
  })

  useEffect(() => {
    listLocations().then(setLocations).catch(console.error)
  }, [])

  const quantity = useWatch({ control, name: 'quantity' })
  const unitCost = useWatch({ control, name: 'unit_cost' })
  const total = Number(quantity || 0) * Number(unitCost || 0)

  async function onSubmit(v: FormValues) {
    try {
      await createPurchase(v)
      navigate('/purchases')
    } catch (e) {
      setError('root', { message: (e as Error).message })
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/purchases" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Nova compra</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-sm">
        <label className={label}>
          Item comprado
          <input className={input} placeholder="Ex.: Notebook Dell Latitude" {...register('item_name')} />
          {errors.item_name && <span className={err}>{errors.item_name.message}</span>}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Tipo
            <select className={input} {...register('asset_type')}>
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </select>
          </label>

          <label className={label}>
            Local de destino
            <select className={input} {...register('location_id')}>
              <option value="">Selecione...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            {errors.location_id && <span className={err}>{errors.location_id.message}</span>}
          </label>
        </div>

        <label className={label}>
          Fornecedor
          <input className={input} {...register('supplier')} />
          {errors.supplier && <span className={err}>{errors.supplier.message}</span>}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Quantidade
            <input type="number" min={1} className={input} {...register('quantity')} />
            {errors.quantity && <span className={err}>{errors.quantity.message}</span>}
          </label>

          <label className={label}>
            Valor unitário (R$)
            <input type="number" step="0.01" min={0} className={input} {...register('unit_cost')} />
            {errors.unit_cost && <span className={err}>{errors.unit_cost.message}</span>}
          </label>
        </div>

        <p className="text-sm text-slate-600">
          Custo total: <strong>{brl(total)}</strong>
        </p>

        <label className={label}>
          Nº da nota fiscal
          <input className={input} {...register('invoice_number')} />
        </label>

        <label className={label}>
          Observações
          <textarea rows={3} className={input} {...register('notes')} />
        </label>

        {errors.root && <p className="text-sm text-red-600">Erro: {errors.root.message}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/purchases" className="rounded-md border border-slate-300 px-4 py-2 text-sm">
            Cancelar
          </Link>
          <button
            disabled={isSubmitting}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : 'Registrar compra'}
          </button>
        </div>
      </form>
    </div>
  )
}