import { PURCHASE_STATUS_LABEL, type PurchaseStatus } from '../types'

const colors: Record<PurchaseStatus, string> = {
  pedido: 'bg-yellow-100 text-yellow-800',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      {PURCHASE_STATUS_LABEL[status]}
    </span>
  )
}