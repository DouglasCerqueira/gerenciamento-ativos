import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { assetSchema } from '../schemas/asset'
import { createAsset, updateAsset } from '../services/assets'
import { listStockPurchases } from '../services/purchases'
import {
  ASSET_STATUS, STATUS_LABEL, TYPE_LABEL,
  type AssetType, type AssetStatus, type AssetStock, type PurchaseStock,
} from '../types'

type FormValues = {
  purchase_id?: string
  name: string
  type: AssetType
  status: AssetStatus
  location_id: string
  quantity: number
  serial_number?: string
  license_key?: string
  expires_at?: string
}

const input =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const label = 'block text-sm font-medium text-slate-700'
const err = 'mt-1 block text-xs text-red-600'

interface Props {
  initial?: AssetStock
  onSaved: () => void
}

export default function AssetForm({ initial, onSaved }: Props) {
  const [purchases, setPurchases] = useState<PurchaseStock[] | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(assetSchema) as unknown as Resolver<FormValues>,
    defaultValues: initial
      ? {
          purchase_id: initial.purchase_id ?? '',
          name: initial.name,
          type: initial.type,
          status: initial.status,
          location_id: initial.location_id,
          quantity: initial.quantity,
          serial_number: initial.serial_number ?? '',
          license_key: initial.license_key ?? '',
          expires_at: initial.expires_at ?? '',
        }
      : {
          purchase_id: '',
          name: '',
          type: 'computador',
          status: 'disponivel',
          location_id: '',
          quantity: 1,
        },
  })

  useEffect(() => {
    if (!initial) listStockPurchases().then(setPurchases).catch(console.error)
  }, [initial])

  const type = useWatch({ control, name: 'type' })
  const purchaseId = useWatch({ control, name: 'purchase_id' })
  const purchase = purchases?.find((p) => p.id === purchaseId)
  const isLicense = type === 'licenca'

  async function onSubmit(v: FormValues) {
    if (!initial && purchase && v.quantity > purchase.remaining) {
      setError('quantity', { message: `Máximo disponível na compra: ${purchase.remaining}` })
      return
    }
    try {
      const data = v as Parameters<typeof createAsset>[0]
      if (initial) await updateAsset(initial.id, data)
      else await createAsset(data)
      onSaved()
    } catch (e) {
      setError('root', { message: (e as Error).message })
    }
  }

  if (!initial && !purchases) return <p className="text-sm text-slate-500">Carregando...</p>

  if (!initial && purchases && purchases.length === 0) {
    return (
      <div className="max-w-xl rounded-xl bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold">Sem estoque disponível</h3>
        <p className="mt-2 text-sm text-slate-600">
          Só é possível cadastrar ativos a partir de compras entregues. Registre uma compra e
          marque-a como entregue para liberar o estoque.
        </p>
        <Link
          to="/purchases"
          className="mt-4 inline-block rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Ir para Compras
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-sm">
      {!initial && (
        <label className={label}>
          Compra (estoque)
          <select
            className={input}
            {...register('purchase_id', {
              onChange: (e) => {
                const p = purchases?.find((x) => x.id === e.target.value)
                setValue('type', p?.asset_type ?? 'computador')
                setValue('location_id', p?.location_id ?? '')
                setValue('name', p?.item_name ?? '')
                setValue('quantity', 1)
              },
            })}
          >
            <option value="">Selecione...</option>
            {(purchases ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.item_name} — {p.supplier} (restante: {p.remaining})
              </option>
            ))}
          </select>
          {(errors.location_id || errors.purchase_id) && (
            <span className={err}>Selecione a compra</span>
          )}
        </label>
      )}

      <input type="hidden" {...register('type')} />
      <input type="hidden" {...register('location_id')} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className={label}>Tipo</span>
          <p className="mt-1 text-sm text-slate-600">{initial || purchase ? TYPE_LABEL[type] : '-'}</p>
        </div>
        <div>
          <span className={label}>Local</span>
          <p className="mt-1 text-sm text-slate-600">
            {initial?.location_name ?? purchase?.location_name ?? '-'}
          </p>
        </div>
      </div>

      <label className={label}>
        Nome
        <input className={input} {...register('name')} />
        {errors.name && <span className={err}>{errors.name.message}</span>}
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={label}>
          Status
          <select className={input} {...register('status')}>
            {ASSET_STATUS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>

        <label className={label}>
          Quantidade
          <input
            type="number"
            min={1}
            max={initial ? undefined : purchase?.remaining}
            className={input}
            {...register('quantity')}
          />
          {errors.quantity && <span className={err}>{errors.quantity.message}</span>}
          {!initial && purchase && (
            <span className="mt-1 block text-xs text-slate-500">
              Restante na compra: {purchase.remaining}
            </span>
          )}
        </label>
      </div>

      {isLicense ? (
        <>
          <label className={label}>
            Chave da licença
            <input className={input} {...register('license_key')} />
            {errors.license_key && <span className={err}>{errors.license_key.message}</span>}
          </label>
          <label className={label}>
            Validade
            <input type="date" className={input} {...register('expires_at')} />
            {errors.expires_at && <span className={err}>{errors.expires_at.message}</span>}
          </label>
        </>
      ) : (
        <label className={label}>
          Nº de série
          <input className={input} {...register('serial_number')} />
          {errors.serial_number && <span className={err}>{errors.serial_number.message}</span>}
        </label>
      )}

      {errors.root && <p className="text-sm text-red-600">Erro: {errors.root.message}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Link to="/assets" className="rounded-md border border-slate-300 px-4 py-2 text-sm">
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