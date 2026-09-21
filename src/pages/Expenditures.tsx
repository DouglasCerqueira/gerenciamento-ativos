import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus } from 'lucide-react'
import { listExpenditures } from '../services/expenditures'
import { listLocations } from '../services/locations'
import Pagination from '../components/Pagination'
import { Can, MANAGERS } from '../lib/roles'
import { fmtDate } from '../lib/format'
import {
  EXPENDITURE_REASONS, REASON_LABEL, TYPE_LABEL,
  type Expenditure, type ExpenditureReason, type AssetLocation,
} from '../types'

const field =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'

export default function Expenditures() {
  const [rows, setRows] = useState<Expenditure[]>([])
  const [total, setTotal] = useState(0)
  const [locations, setLocations] = useState<AssetLocation[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState<ExpenditureReason | ''>('')
  const [locationId, setLocationId] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listLocations().then(setLocations).catch(console.error)
  }, [])

  useEffect(() => {
    let ignore = false
    listExpenditures({ page, pageSize, search, reason, locationId })
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
  }, [page, pageSize, search, reason, locationId])

  const onFilter = (fn: () => void) => {
    fn()
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Baixas</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            <Filter size={16} /> Filtros
          </button>
          <Can roles={MANAGERS}>
            <Link
              to="/expenditures/new"
              className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <Plus size={16} /> Nova baixa
            </Link>
          </Can>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3">
          <input
            className={field}
            placeholder="Buscar por ativo..."
            value={search}
            onChange={(e) => onFilter(() => setSearch(e.target.value))}
          />
          <select
            className={field}
            value={reason}
            onChange={(e) => onFilter(() => setReason(e.target.value as ExpenditureReason | ''))}
          >
            <option value="">Todos os motivos</option>
            {EXPENDITURE_REASONS.map((r) => (
              <option key={r} value={r}>{REASON_LABEL[r]}</option>
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
                <th className="px-6 py-3">Ativo</th>
                <th className="px-6 py-3">Local</th>
                <th className="px-6 py-3">Qtd</th>
                <th className="px-6 py-3">Motivo</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link to={`/expenditures/${r.id}`} className="font-medium text-sky-600 hover:underline">
                      {r.asset_name}
                    </Link>
                    <div className="text-xs text-slate-500">{TYPE_LABEL[r.asset_type]}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{r.locations?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{r.quantity}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {REASON_LABEL[r.reason]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{fmtDate(r.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/expenditures/${r.id}`} className="text-sky-600 hover:underline">Ver</Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma baixa encontrada.
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
    </div>
  )
}