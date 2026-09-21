import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
  onPageSize: (size: number) => void
}

const btn = 'rounded-md border border-slate-300 p-1.5 text-slate-600 disabled:opacity-40'

export default function Pagination({ page, pageSize, total, onPage, onPageSize }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-6 py-4 text-sm text-slate-600">
      <span>Mostrando {from} a {to} de {total} resultados</span>
      <div className="flex items-center gap-3">
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-2 py-1"
        >
          {[5, 10, 25, 50].map((n) => (
            <option key={n} value={n}>{n} por página</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <button className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft size={16} />
          </button>
          <span className="rounded-md border border-sky-600 px-3 py-1 text-sky-700">{page}</span>
          <button className={btn} disabled={page >= pages} onClick={() => onPage(page + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}