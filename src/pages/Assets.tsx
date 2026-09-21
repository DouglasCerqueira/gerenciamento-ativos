import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus } from 'lucide-react'
import { listAssetsStock, deleteAsset } from '../services/assets'
import { listLocations } from '../services/locations'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Can, MANAGERS } from '../lib/roles'
import {
  ASSET_TYPES, ASSET_STATUS, STATUS_LABEL, TYPE_LABEL,
  type AssetStock, type AssetType, type AssetStatus, type AssetLocation,
} from '../types'

const field =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'

export default function Assets() {
  const [rows, setRows] = useState<AssetStock[]>([])
  const [total, setTotal] = useState(0)
  const [locations, setLocations] = useState<AssetLocation[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<AssetType | ''>('')
  const [locationId, setLocationId] = useState('')
  const [status, setStatus] = useState<AssetStatus | ''>('')
  const [showFilters, setShowFilters] = useState(false)
  const [toDelete, setToDelete] = useState<AssetStock | null>(null)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listLocations().then(setLocations).catch(console.error)
  }, [])

  useEffect(() => {
    let ignore = false
    listAssetsStock({ page, pageSize, search, type, locationId, status })
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
  }, [page, pageSize, search, type, locationId, status, reload])

  const onFilter = (fn: () => void) => {
    fn()
    setPage(1)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteAsset(toDelete.id)
      if (rows.length === 1 && page > 1) setPage(page - 1)
      setReload((r) => r + 1)
    } catch (e) {
      setError((e as Error).message)
    }
    setToDelete(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ativos</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            <Filter size={16} /> Filtros
          </button>
          <Can roles={MANAGERS}>
            <Link
              to="/assets/new"
              className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <Plus size={16} /> Novo ativo
            </Link>
          </Can>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <input
            className={field}
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => onFilter(() => setSearch(e.target.value))}
          />
          <select
            className={field}
            value={type}
            onChange={(e) => onFilter(() => setType(e.target.value as AssetType | ''))}
          >
            <option value="">Todos os tipos</option>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
          <select
            className={field}
            value={locationId}
            onChange={(e) => onFilter(() => setLocationId(e.target.value))}
          >
            <option value="">Todos os locais</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <select
            className={field}
            value={status}
            onChange={(e) => onFilter(() => setStatus(e.target.value as AssetStatus | ''))}
          >
            <option value="">Todos os status</option>
            {ASSET_STATUS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
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
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Local</th>
                <th className="px-6 py-3">Disponível</th>
                <th className="px-6 py-3">Atribuído</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link to={`/assets/${a.id}`} className="font-medium text-sky-600 hover:underline">
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{TYPE_LABEL[a.type]}</td>
                  <td className="px-6 py-4 text-slate-600">{a.location_name}</td>
                  <td className="px-6 py-4 text-slate-600">{a.available}</td>
                  <td className="px-6 py-4 text-slate-600">{a.assigned}</td>
                  <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                  <td className="space-x-4 px-6 py-4 text-right">
                    <Link to={`/assets/${a.id}`} className="text-sky-600 hover:underline">Ver</Link>
                    <Can roles={MANAGERS}>
                      <Link to={`/assets/${a.id}/edit`} className="text-blue-800 hover:underline">
                        Editar
                      </Link>
                      <button onClick={() => setToDelete(a)} className="text-red-600 hover:underline">
                        Excluir
                      </button>
                    </Can>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhum ativo encontrado.
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
        open={!!toDelete}
        danger
        title="Excluir ativo"
        message={`Tem certeza que deseja excluir "${toDelete?.name}"? O histórico de atribuições dele também será removido.`}
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}