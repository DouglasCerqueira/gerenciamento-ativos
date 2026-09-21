import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { locationSchema } from '../schemas/settings'
import { createLocation, updateLocation, deleteLocation } from '../services/settings'
import { listLocations } from '../services/locations'
import ConfirmDialog from './ConfirmDialog'
import type { AssetLocation } from '../types'

type FormValues = { name: string }

const input =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'

export default function LocationsTab() {
  const [rows, setRows] = useState<AssetLocation[]>([])
  const [editing, setEditing] = useState<AssetLocation | null>(null)
  const [toDelete, setToDelete] = useState<AssetLocation | null>(null)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(locationSchema) as unknown as Resolver<FormValues>,
    defaultValues: { name: '' },
  })

  useEffect(() => {
    listLocations().then(setRows).catch((e: Error) => setError(e.message))
  }, [reload])

  function startEdit(l: AssetLocation | null) {
    setEditing(l)
    reset({ name: l?.name ?? '' })
  }

  async function onSubmit(v: FormValues) {
    try {
      if (editing) await updateLocation(editing.id, v.name)
      else await createLocation(v.name)
      startEdit(null)
      setReload((r) => r + 1)
    } catch (e) {
      setFormError('root', { message: (e as Error).message })
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteLocation(toDelete.id)
      if (editing?.id === toDelete.id) startEdit(null)
      setError('')
      setReload((r) => r + 1)
    } catch (e) {
      setError((e as Error).message)
    }
    setToDelete(null)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">{editing ? 'Renomear local' : 'Novo local'}</h3>
        <div className="mt-4 flex items-start gap-3">
          <div className="flex-1">
            <input className={input} placeholder="Nome do local" {...register('name')} />
            {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
          </div>
          <button
            disabled={isSubmitting}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => startEdit(null)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
        {errors.root && <p className="mt-2 text-sm text-red-600">{errors.root.message}</p>}
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{l.name}</td>
                <td className="space-x-4 px-6 py-4 text-right">
                  <button onClick={() => startEdit(l)} className="text-blue-800 hover:underline">
                    Editar
                  </button>
                  <button onClick={() => setToDelete(l)} className="text-red-600 hover:underline">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                  Nenhum local cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Excluir local"
        message={`Tem certeza que deseja excluir "${toDelete?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}