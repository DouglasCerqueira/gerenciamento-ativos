import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getPurchase } from '../services/purchases'
import PurchaseStatusBadge from '../components/PurchaseStatusBadge'
import { brl, fmtDateTime } from '../lib/format'
import { TYPE_LABEL, type PurchaseStock } from '../types'

export default function PurchaseDetail() {
  const { id } = useParams()
  const [purchase, setPurchase] = useState<PurchaseStock | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) getPurchase(id).then(setPurchase).catch((e: Error) => setError(e.message))
  }, [id])

  if (error) return <p className="text-sm text-red-600">Erro: {error}</p>
  if (!purchase) return null

  const rows: [string, ReactNode][] = [
    ['Tipo', TYPE_LABEL[purchase.asset_type]],
    ['Local de destino', purchase.location_name],
    ['Fornecedor', purchase.supplier],
    ['Quantidade comprada', purchase.quantity],
    ['Já cadastrados em Ativos', purchase.registered],
    ['Restante para cadastro', purchase.remaining],
    ['Custo unitário', brl(purchase.unit_cost)],
    ['Custo total', brl(purchase.total_cost)],
    ['Nº da nota fiscal', purchase.invoice_number],
    ['Status', <PurchaseStatusBadge status={purchase.status} />],
    ['Comprado por', purchase.purchased_by],
    ['Data da compra', fmtDateTime(purchase.purchased_at)],
    ['Data de entrega', purchase.delivered_at ? fmtDateTime(purchase.delivered_at) : null],
    ['Observações', purchase.notes],
  ]

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/purchases" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Detalhes da compra</h2>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold">{purchase.item_name}</h3>
          <p className="text-sm text-slate-500">
            {purchase.quantity} unidades de {purchase.supplier}
          </p>
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