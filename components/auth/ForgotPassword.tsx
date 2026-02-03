import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle, IdCard } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [cedula, setCedula] = useState('')
  const [error, setError] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setToken(null)
    setLoading(true)
    try {
      if (step === 1) {
        const res = await requestPasswordReset(email.trim())
        if (res.requiresCedula) {
          setStep(2)
        }
      } else {
        const res = await requestPasswordReset(email.trim(), cedula.trim())
        if (res.token) setToken(res.token)
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo generar el enlace de recuperación')
    } finally {
      setLoading(false)
    }
  }

  const resetLink = token ? `${window.location.origin}/reset-password?token=${token}` : ''

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} className="mr-1" /> Volver al login
        </Link>

        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Recuperar contraseña</h1>
          <p className="text-slate-500 text-sm">
            Ingresa tu correo y, si existe, valida con tu cédula para generar el enlace temporal.
          </p>
        </div>

        {error && (
          <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="tu@correo.com"
              disabled={step === 2}
            />
          </div>
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cédula</label>
              <div className="relative">
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ingresa tu cédula"
                />
                <IdCard size={18} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? 'Procesando...' : step === 1 ? 'Validar correo' : 'Generar enlace'}
            <Send size={18} className="ml-2" />
          </button>
        </form>

        {token && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700 space-y-2">
            <div className="flex items-center font-semibold">
              <CheckCircle size={18} className="mr-2" /> Enlace generado
            </div>
            <p>Copia y pega este enlace para restablecer la contraseña:</p>
            <div className="bg-white border border-emerald-100 rounded p-2 text-xs break-all">{resetLink}</div>
            <p className="text-xs text-emerald-600">Expira en 30 minutos.</p>
          </div>
        )}
      </div>
    </div>
  )
}
