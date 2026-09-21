import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: number
  icon: LucideIcon
  color: string
}

export default function StatCard({ label, value, icon: Icon, color }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  )
}