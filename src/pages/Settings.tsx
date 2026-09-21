import { useState } from 'react'
import LocationsTab from '../components/LocationsTab'
import EmployeesTab from '../components/EmployeesTab'

const TABS = [
  { id: 'locations', label: 'Locais' },
  { id: 'employees', label: 'Funcionários' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function Settings() {
  const [tab, setTab] = useState<TabId>('locations')

  return (
    <div>
      <h2 className="text-2xl font-bold">Configurações</h2>

      <div className="mt-6 flex gap-6 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium ${
              tab === t.id
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === 'locations' ? <LocationsTab /> : <EmployeesTab />}</div>
    </div>
  )
}