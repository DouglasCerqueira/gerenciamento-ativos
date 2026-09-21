import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus } from 'lucide-react'
import { listPurchases, markDelivered, cancelPurchase } from '../services/purchases'
import { listLocations } from '../services/locations'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import PurchaseStatusBadge from '../components/PurchaseStatusBadge'
import { Can, MANAGERS } from '../lib/roles'
import { brl, fmtDate } from '../lib/format'
import {
  PURCHASE_STATUS, PURCHASE_STATUS_LABEL, TYPE_LABEL,
  type PurchaseStock, type PurchaseStatus, type AssetLocation,
} from '../types'

const field =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'

type Action = { kind: 'deliver' | 'cancel'; purchase: PurchaseStock }

export default function Purchases() {
  const [rows, setRows] = useState<PurchaseStock[]>([])
  const [total, setTotal] = useState(0)
  const [locations, setLocations] = useState<AssetLocation[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PurchaseStatus | ''>('')
  const [locationId, setLocationId] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [action, setAction] = useState<Action | null>(null)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listLocations().then(setLocations).catch(console.error)
  }, [])

  useEffect(() => {
    let ignore = false
    listPurchases({ page, pageSize, search, status, locationId })
      .then(({ data, count }) => {
        if (ignore) return
        setRows(data)
        setTotal(count)
        setError('')
      })
      .catch((e: Error) => {
        if (!ignore) setError(e.message)
      })
    return () => {
      ignore = true
    }
  }, [page, pageSize, search, status, locationId, reload])

  const onFilter = (fn: () => void) => {
    fn()
    setPage(1)
  }

  async function confirm() {
    if (!action) return
    try {
      if (action.kind === 'deliver') await markDelivered(action.purchase.id)
      else await cancelPurchase(action.purchase.id)
      setReload((r) => r + 1)
    } catch (e) {
      setError((e as Error).message)
    }
    setAction(null)
  }

  const p = action?.purchase
  const desc = p ? `${p.quantity} ${p.item_name}` : ''

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compras</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            <Filter size={16} /> Filtros
          </button>
          <Can roles={MANAGERS}>
            <Link
              to="/purchases/new"
              className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <Plus size={16} /> Nova compra
            </Link>
          </Can>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3">
          <input
            className={field}
            placeholder="Buscar por item..."
            value={search}
            onChange={(e) => onFilter(() => setSearch(e.target.value))}
          />
          <select
            className={field}
            value={status}
            onChange={(e) => onFilter(() => setStatus(e.target.value as PurchaseStatus | ''))}
          >
            <option value="">Todos os status</option>
            {PURCHASE_STATUS.map((s) => (
              <option key={s} value={s}>{PURCHASE_STATUS_LABEL[s]}</option>
            ))}
          </select>
          <select className={field} value={locationId} onChange={(e) => onFilter(() => setLocationId(e.target.value))}>
            <option value="">Todos os locais</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">Erro: {error}</p>}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Local</th>
                <th className="px-6 py-3">Fornecedor</th>
                <th className="px-6 py-3">Qtd</th>
                <th className="px-6 py-3">Custo total</th>
                <th className="px-6 py-3">Cadastrados</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link to={`/purchases/${r.id}`} className="font-medium text-sky-600 hover:underline">
                      {r.item_name}
                    </Link>
                    <div className="text-xs text-slate-500">{TYPE_LABEL[r.asset_type]}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{r.location_name}</td>
                  <td className="px-6 py-4 text-slate-600">{r.supplier}</td>
                  <td className="px-6 py-4 text-slate-600">{r.quantity}</td>
                  <td className="px-6 py-4 text-slate-600">{brl(r.total_cost)}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {r.status === 'entregue' ? `${r.registered}/${r.quantity}` : '-'}
                  </td>
                  <td className="px-6 py-4"><PurchaseStatusBadge status={r.status} /></td>
                  <td className="px-6 py-4 text-slate-600">{fmtDate(r.purchased_at)}</td>
                  <td className="space-x-4 whitespace-nowrap px-6 py-4 text-right">
                    <Link to={`/purchases/${r.id}`} className="text-sky-600 hover:underline">Ver</Link>
                    <Can roles={MANAGERS}>
                      {r.status === 'pedido' && (
                        <>
                          <button
                            onClick={() => setAction({ kind: 'deliver', purchase: r })}
                            className="text-green-700 hover:underline"
                          >
                            Marcar entregue
                          </button>
                          <button
                            onClick={() => setAction({ kind: 'cancel', purchase: r })}
                            className="text-red-600 hover:underline"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </Can>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma compra encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPage={setPage}
          onPageSize={(s) => onFilter(() => setPageSize(s))}
        />
      </div>

      <ConfirmDialog
        open={!!action}
        danger={action?.kind === 'cancel'}
        title={action?.kind === 'deliver' ? 'Marcar compra como entregue' : 'Cancelar compra'}
        message={
          action?.kind === 'deliver'
            ? `Confirmar a entrega da compra de ${desc}? O estoque será liberado para cadastro em Ativos.`
            : `Tem certeza que deseja cancelar a compra de ${desc}?`
        }
        confirmLabel={action?.kind === 'deliver' ? 'Marcar como entregue' : 'Cancelar compra'}
        onConfirm={confirm}
        onCancel={() => setAction(null)}
      />
    </div>
  )
}