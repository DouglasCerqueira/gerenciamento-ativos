import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getAssignment } from '../services/assignments'
import AssignmentBadge from '../components/AssignmentBadge'
import { fmtDateTime } from '../lib/format'
import { TYPE_LABEL, type AssignmentDetail as Detail } from '../types'

export default function AssignmentDetail() {
  const { id } = useParams()
  const [item, setItem] = useState<Detail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) getAssignment(id).then(setItem).catch((e: Error) => setError(e.message))
  }, [id])

  if (error) return <p className="text-sm text-red-600">Erro: {error}</p>
  if (!item) return null

  const rows: [string, ReactNode][] = [
    [
      'Ativo',
      <Link to={`/assets/${item.asset_id}`} className="text-sky-600 hover:underline">
        {item.assets?.name}
      </Link>,
    ],
    ['Tipo', item.assets ? TYPE_LABEL[item.assets.type] : null],
    ['Local', item.assets?.locations?.name],
    ['Funcionário', item.employees?.name],
    ['Departamento', item.employees?.department],
    ['Quantidade', item.quantity],
    ['Status', <AssignmentBadge returned={!!item.returned_at} />],
    ['Atribuído em', fmtDateTime(item.assigned_at)],
    ['Devolvido em', item.returned_at ? fmtDateTime(item.returned_at) : null],
    ['Atribuído por', item.assigned_by],
    ['Observações', item.notes],
  ]

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/assignments" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Detalhes da atribuição</h2>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold">{item.assets?.name}</h3>
          <p className="text-sm text-slate-500">
            {item.quantity} unidade(s) com {item.employees?.name}
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