import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getExpenditure } from '../services/expenditures'
import { fmtDateTime } from '../lib/format'
import { REASON_LABEL, TYPE_LABEL, type Expenditure } from '../types'

export default function ExpenditureDetail() {
  const { id } = useParams()
  const [item, setItem] = useState<Expenditure | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) getExpenditure(id).then(setItem).catch((e: Error) => setError(e.message))
  }, [id])

  if (error) return <p className="text-sm text-red-600">Erro: {error}</p>
  if (!item) return null

  const rows: [string, ReactNode][] = [
    [
      'Ativo',
      item.asset_id ? (
        <Link to={`/assets/${item.asset_id}`} className="text-sky-600 hover:underline">
          {item.asset_name}
        </Link>
      ) : (
        item.asset_name
      ),
    ],
    ['Tipo', TYPE_LABEL[item.asset_type]],
    ['Local', item.locations?.name],
    ['Quantidade', item.quantity],
    ['Motivo', REASON_LABEL[item.reason]],
    ['Registrado por', item.registered_by],
    ['Data', fmtDateTime(item.created_at)],
    ['Observações', item.notes],
  ]

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/expenditures" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Detalhes da baixa</h2>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold">{item.asset_name}</h3>
          <p className="text-sm text-slate-500">
            {item.quantity} unidade(s) baixada(s) por {REASON_LABEL[item.reason].toLowerCase()}
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