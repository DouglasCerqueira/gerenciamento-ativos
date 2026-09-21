import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Package, TrendingUp, UserCheck } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { getDashboardAssets, getExpendedTotal } from '../services/dashboard'
import { listLocations } from '../services/locations'
import { listTransfers } from '../services/transfers'
import { listPurchases } from '../services/purchases'
import StatCard from '../components/StatCard'
import PurchaseStatusBadge from '../components/PurchaseStatusBadge'
import { brl } from '../lib/format'
import {
  ASSET_TYPES, TYPE_LABEL,
  type AssetStock, type AssetType, type AssetLocation, type Transfer, type PurchaseStock,
} from '../types'

const field =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const label = 'block text-sm font-medium text-slate-700'
const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6']

type NumKey = 'quantity' | 'available' | 'assigned'
const sum = (items: AssetStock[], key: NumKey) =>
  items.reduce((s, a) => s + Number(a[key]), 0)

function RecentCard({
  title, to, empty, items = [],
}: { title: string; to: string; empty: string; items?: ReactNode[] }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Link to={to} className="text-sm text-sky-600 hover:underline">Ver todas</Link>
      </div>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 text-sm">{items}</ul>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [assets, setAssets] = useState<AssetStock[]>([])
  const [locations, setLocations] = useState<AssetLocation[]>([])
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([])
  const [recentPurchases, setRecentPurchases] = useState<PurchaseStock[]>([])
  const [expended, setExpended] = useState(0)
  const [locationId, setLocationId] = useState('')
  const [type, setType] = useState<AssetType | ''>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    listLocations().then(setLocations).catch(console.error)
  }, [])

  useEffect(() => {
    listTransfers({ page: 1, pageSize: 5, search: '', fromId: '', toId: '' })
      .then(({ data }) => setRecentTransfers(data))
      .catch(console.error)
    listPurchases({ page: 1, pageSize: 5, search: '', status: '', locationId: '' })
      .then(({ data }) => setRecentPurchases(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    let ignore = false
    getDashboardAssets({ locationId, type, from, to })
      .then((data) => {
        if (ignore) return
        setAssets(data)
        setError('')
      })
      .catch((e: Error) => {
        if (!ignore) setError(e.message)
      })
    getExpendedTotal({ locationId, type, from, to })
      .then((n) => {
        if (!ignore) setExpended(n)
      })
      .catch(console.error)
    return () => {
      ignore = true
    }
  }, [locationId, type, from, to])

  const byType = ASSET_TYPES.map((t) => {
    const items = assets.filter((a) => a.type === t)
    return {
      name: TYPE_LABEL[t],
      total: sum(items, 'quantity'),
      available: sum(items, 'available'),
      assigned: sum(items, 'assigned'),
    }
  }).filter((d) => d.total > 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-4">
        <label className={label}>
          Local
          <select className={field} value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            <option value="">Todos</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>

        <label className={label}>
          Tipo de ativo
          <select className={field} value={type} onChange={(e) => setType(e.target.value as AssetType | '')}>
            <option value="">Todos</option>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
        </label>

        <label className={label}>
          Cadastrado de
          <input type="date" className={field} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>

        <label className={label}>
          até
          <input type="date" className={field} value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">Erro: {error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de ativos" value={assets.length} icon={Package} color="bg-sky-600" />
        <StatCard label="Unidades disponíveis" value={sum(assets, 'available')} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Unidades atribuídas" value={sum(assets, 'assigned')} icon={UserCheck} color="bg-amber-500" />
        <StatCard label="Unidades baixadas" value={expended} icon={Archive} color="bg-red-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Ativos por tipo</h3>
          <div className="mt-4 h-72">
            {byType.length === 0 ? (
              <p className="pt-24 text-center text-sm text-slate-500">Sem dados.</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byType} dataKey="total" nameKey="name" outerRadius={100}>
                    {byType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Disponibilidade</h3>
          <div className="mt-4 h-72">
            {byType.length === 0 ? (
              <p className="pt-24 text-center text-sm text-slate-500">Sem dados.</p>
            ) : (
              <ResponsiveContainer>
                <BarChart data={byType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="available" name="Disponível" fill="#10b981" />
                  <Bar dataKey="assigned" name="Atribuído" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentCard
          title="Transferências recentes"
          to="/transfers"
          empty="Nenhuma transferência ainda."
          items={recentTransfers.map((t) => (
            <li key={t.id} className="flex justify-between py-2">
              <span>{t.asset_name} ({t.quantity})</span>
              <span className="text-slate-500">
                {t.from_location?.name} → {t.to_location?.name}
              </span>
            </li>
          ))}
        />
        <RecentCard
          title="Compras recentes"
          to="/purchases"
          empty="Nenhuma compra registrada."
          items={recentPurchases.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2">
              <Link to={`/purchases/${p.id}`} className="text-sky-600 hover:underline">
                {p.item_name} ({p.quantity})
              </Link>
              <span className="flex items-center gap-3 text-slate-500">
                {brl(p.total_cost)}
                <PurchaseStatusBadge status={p.status} />
              </span>
            </li>
          ))}
        />
      </div>
    </div>
  )
}