import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AssetForm from '../components/AssetForm'
import { getAsset } from '../services/assets'
import type { AssetStock } from '../types'

export default function AssetFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState<AssetStock>()
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) getAsset(id).then(setAsset).catch((e: Error) => setError(e.message))
  }, [id])

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/assets" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">{id ? 'Editar ativo' : 'Novo ativo'}</h2>
      </div>

      {error && <p className="text-sm text-red-600">Erro: {error}</p>}
      {!error && (!id || asset) && (
        <AssetForm key={asset?.id ?? 'new'} initial={asset} onSaved={() => navigate('/assets')} />
      )}
    </div>
  )
}