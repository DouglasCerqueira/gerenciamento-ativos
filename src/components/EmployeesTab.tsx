import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeSchema } from '../schemas/settings'
import { createEmployee, updateEmployee, deleteEmployee } from '../services/settings'
import { listEmployees } from '../services/assignments'
import ConfirmDialog from './ConfirmDialog'
import type { Employee } from '../types'

type FormValues = { name: string; email: string; department?: string }

const input =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600'
const label = 'block text-sm font-medium text-slate-700'
const err = 'mt-1 block text-xs text-red-600'

export default function EmployeesTab() {
  const [rows, setRows] = useState<Employee[]>([])
  const [editing, setEditing] = useState<Employee | null>(null)
  const [toDelete, setToDelete] = useState<Employee | null>(null)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(employeeSchema) as unknown as Resolver<FormValues>,
    defaultValues: { name: '', email: '', department: '' },
  })

  useEffect(() => {
    listEmployees().then(setRows).catch((e: Error) => setError(e.message))
  }, [reload])

  function startEdit(emp: Employee | null) {
    setEditing(emp)
    reset({ name: emp?.name ?? '', email: emp?.email ?? '', department: emp?.department ?? '' })
  }

  async function onSubmit(v: FormValues) {
    try {
      if (editing) await updateEmployee(editing.id, v)
      else await createEmployee(v)
      startEdit(null)
      setReload((r) => r + 1)
    } catch (e) {
      setFormError('root', { message: (e as Error).message })
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteEmployee(toDelete.id)
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
        <h3 className="text-lg font-semibold">{editing ? 'Editar funcionário' : 'Novo funcionário'}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className={label}>
            Nome
            <input className={input} {...register('name')} />
            {errors.name && <span className={err}>{errors.name.message}</span>}
          </label>
          <label className={label}>
            Email
            <input className={input} {...register('email')} />
            {errors.email && <span className={err}>{errors.email.message}</span>}
          </label>
          <label className={label}>
            Departamento
            <input className={input} {...register('department')} />
          </label>
        </div>
        {errors.root && <p className="mt-3 text-sm text-red-600">{errors.root.message}</p>}
        <div className="mt-4 flex gap-3">
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
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Departamento</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{emp.name}</td>
                  <td className="px-6 py-4 text-slate-600">{emp.email}</td>
                  <td className="px-6 py-4 text-slate-600">{emp.department ?? '-'}</td>
                  <td className="space-x-4 whitespace-nowrap px-6 py-4 text-right">
                    <button onClick={() => startEdit(emp)} className="text-blue-800 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => setToDelete(emp)} className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum funcionário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Excluir funcionário"
        message={`Tem certeza que deseja excluir ${toDelete?.name}?`}
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}