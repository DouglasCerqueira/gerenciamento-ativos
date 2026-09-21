import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getAsset } from '../services/assets'
import StatusBadge from '../components/StatusBadge'
import { Can, MANAGERS } from '../lib/roles'
import { TYPE_LABEL, type AssetStock } from '../types'

const fmt = (d: string) => new Date(d).toLocaleString('pt-BR')

export default function AssetDetail() {
  const { id } = useParams()
  const [asset, setAsset] = useState<AssetStock | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) getAsset(id).then(setAsset).catch((e: Error) => setError(e.message))
  }, [id])

  if (error) return <p className="text-sm text-red-600">Erro: {error}</p>
  if (!asset) return null

  const specific: [string, ReactNode][] =
    asset.type === 'licenca'
      ? [['Chave da licença', asset.license_key], ['Validade', asset.expires_at]]
      : [['Nº de série', asset.serial_number]]

  const rows: [string, ReactNode][] = [
    ['Tipo', TYPE_LABEL[asset.type]],
    ['Local', asset.location_name],
    ['Quantidade total', asset.quantity],
    ['Disponível', asset.available],
    ['Atribuído', asset.assigned],
    ['Status', <StatusBadge status={asset.status} />],
    ...specific,
    ['Cadastrado em', fmt(asset.created_at)],
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/assets" className="text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-2xl font-bold">Detalhes do ativo</h2>
        </div>
        <Can roles={MANAGERS}>
          <Link
            to={`/assets/${asset.id}/edit`}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Editar
          </Link>
        </Can>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold">{asset.name}</h3>
          <p className="text-sm text-slate-500">{TYPE_LABEL[asset.type]} em {asset.location_name}</p>
        </div>
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-3 px-6 py-4 text-sm odd:bg-slate-50">
            <span className="text-slate-500">{label}</span>
            <span className="col-span-2">{value ?? '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}