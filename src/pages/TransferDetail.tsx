import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getTransfer } from '../services/transfers'
import { TYPE_LABEL, type Transfer } from '../types'

const fmt = (d: string) => new Date(d).toLocaleString('pt-BR')

export default function TransferDetail() {
  const { id } = useParams()
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) getTransfer(id).then(setTransfer).catch((e: Error) => setError(e.message))
  }, [id])

  if (error) return <p className="text-sm text-red-600">Erro: {error}</p>
  if (!transfer) return null

  const rows: [string, ReactNode][] = [
    [
      'Ativo',
      transfer.asset_id ? (
        <Link to={`/assets/${transfer.asset_id}`} className="text-sky-600 hover:underline">
          {transfer.asset_name}
        </Link>
      ) : (
        transfer.asset_name
      ),
    ],
    ['Tipo', TYPE_LABEL[transfer.asset_type]],
    ['Local de origem', transfer.from_location?.name],
    ['Local de destino', transfer.to_location?.name],
    ['Quantidade', transfer.quantity],
    ['Transferido por', transfer.transferred_by],
    ['Data', fmt(transfer.created_at)],
    ['Observações', transfer.notes],
  ]

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/transfers" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">Detalhes da transferência</h2>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold">{transfer.asset_name}</h3>
          <p className="text-sm text-slate-500">
            De {transfer.from_location?.name} para {transfer.to_location?.name}
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