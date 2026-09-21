import { STATUS_LABEL, type AssetStatus } from '../types'

const colors: Record<AssetStatus, string> = {
  disponivel: 'bg-green-100 text-green-800',
  em_uso: 'bg-yellow-100 text-yellow-800',
  manutencao: 'bg-orange-100 text-orange-800',
}

export default function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}