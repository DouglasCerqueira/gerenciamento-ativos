import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus } from 'lucide-react'
import { listAssignments, listEmployees, returnAssignment } from '../services/assignments'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import AssignmentBadge from '../components/AssignmentBadge'
import { fmtDate } from '../lib/format'
import { TYPE_LABEL, type AssignmentDetail, type Employee } from '../types'

const field =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'

export default function Assignments() {
  const [rows, setRows] = useState<AssignmentDetail[]>([])
  const [total, setTotal] = useState(0)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [employeeId, setEmployeeId] = useState('')
  const [status, setStatus] = useState<'ativa' | 'devolvida' | ''>('')
  const [showFilters, setShowFilters] = useState(false)
  const [toReturn, setToReturn] = useState<AssignmentDetail | null>(null)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listEmployees().then(setEmployees).catch(console.error)
  }, [])

  useEffect(() => {
    let ignore = false
    listAssignments({ page, pageSize, employeeId, status })
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
  }, [page, pageSize, employeeId, status, reload])

  const onFilter = (fn: () => void) => {
    fn()
    setPage(1)
  }

  async function confirmReturn() {
    if (!toReturn) return
    try {
      await returnAssignment(toReturn.id)
      setReload((r) => r + 1)
    } catch (e) {
      setError((e as Error).message)
    }
    setToReturn(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Atribuições</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            <Filter size={16} /> Filtros
          </button>
          <Link
            to="/assignments/new"
            className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            <Plus size={16} /> Nova atribuição
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2">
          <select className={field} value={employeeId} onChange={(e) => onFilter(() => setEmployeeId(e.target.value))}>
            <option value="">Todos os funcionários</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <select
            className={field}
            value={status}
            onChange={(e) => onFilter(() => setStatus(e.target.value as 'ativa' | 'devolvida' | ''))}
          >
            <option value="">Todos os status</option>
            <option value="ativa">Ativa</option>
            <option value="devolvida">Devolvida</option>
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
                <th className="px-6 py-3">Funcionário</th>
                <th className="px-6 py-3">Qtd</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link to={`/assignments/${a.id}`} className="font-medium text-sky-600 hover:underline">
                      {a.assets?.name}
                    </Link>
                    <div className="text-xs text-slate-500">{a.assets ? TYPE_LABEL[a.assets.type] : ''}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {a.employees?.name}
                    <div className="text-xs text-slate-500">{a.employees?.department}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{a.quantity}</td>
                  <td className="px-6 py-4"><AssignmentBadge returned={!!a.returned_at} /></td>
                  <td className="px-6 py-4 text-slate-600">{fmtDate(a.assigned_at)}</td>
                  <td className="space-x-4 whitespace-nowrap px-6 py-4 text-right">
                    <Link to={`/assignments/${a.id}`} className="text-sky-600 hover:underline">Ver</Link>
                    {!a.returned_at && (
                      <button onClick={() => setToReturn(a)} className="text-green-700 hover:underline">
                        Devolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma atribuição encontrada.
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
        open={!!toReturn}
        title="Registrar devolução"
        message={`Confirmar a devolução de ${toReturn?.quantity} × ${toReturn?.assets?.name} por ${toReturn?.employees?.name}?`}
        confirmLabel="Devolver"
        onConfirm={confirmReturn}
        onCancel={() => setToReturn(null)}
      />
    </div>
  )
}