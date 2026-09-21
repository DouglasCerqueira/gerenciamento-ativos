import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus } from 'lucide-react'
import { listTransfers } from '../services/transfers'
import { listLocations } from '../services/locations'
import Pagination from '../components/Pagination'
import { Can, MANAGERS } from '../lib/roles'
import { TYPE_LABEL, type Transfer, type AssetLocation } from '../types'

const field =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR')

export default function Transfers() {
  const [rows, setRows] = useState<Transfer[]>([])
  const [total, setTotal] = useState(0)
  const [locations, setLocations] = useState<AssetLocation[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listLocations().then(setLocations).catch(console.error)
  }, [])

  useEffect(() => {
    let ignore = false
    listTransfers({ page, pageSize, search, fromId, toId })
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
  }, [page, pageSize, search, fromId, toId])

  const onFilter = (fn: () => void) => {
    fn()
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transferências</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            <Filter size={16} /> Filtros
          </button>
          <Can roles={MANAGERS}>
            <Link
              to="/transfers/new"
              className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <Plus size={16} /> Nova transferência
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
          <select className={field} value={fromId} onChange={(e) => onFilter(() => setFromId(e.target.value))}>
            <option value="">Qualquer origem</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <select className={field} value={toId} onChange={(e) => onFilter(() => setToId(e.target.value))}>
            <option value="">Qualquer destino</option>
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
                <th className="px-6 py-3">De</th>
                <th className="px-6 py-3">Para</th>
                <th className="px-6 py-3">Quantidade</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link to={`/transfers/${t.id}`} className="font-medium text-sky-600 hover:underline">
                      {t.asset_name}
                    </Link>
                    <div className="text-xs text-slate-500">{TYPE_LABEL[t.asset_type]}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{t.from_location?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{t.to_location?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{t.quantity}</td>
                  <td className="px-6 py-4 text-slate-600">{fmt(t.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/transfers/${t.id}`} className="text-sky-600 hover:underline">Ver</Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma transferência encontrada.
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