import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const timeout = setTimeout(() => {
      console.warn('[Login] Timeout alcanzado');
      setError('La autenticación está tardando. Verifica tu conexión e intenta de nuevo.');
      setLoading(false);
    }, 15000);

    console.log('[Login] Botón presionado');
    console.log('[Login] Email ingresado:', email);
    console.log('[Login] Password longitud:', password.length);

    try {
      await onLogin(email.trim(), password);
      console.log('[Login] Autenticación exitosa, navegando a dashboard');
    } catch (err: any) {
      console.warn('[Login] Error en autenticación:', err?.message || err);
      setError(err?.message || 'No se pudo iniciar sesión. Intenta nuevamente.');
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Bienvenido</h1>
          <p className="text-slate-500 mt-2">Ingresa tu correo y contraseña para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800 placeholder-slate-400"
              placeholder="Ej: usuario@correo.com"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800 placeholder-slate-400"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="text-center text-sm">
            <a href="/forgot-password" className="text-emerald-600 hover:text-emerald-700 font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>FONDOF - Fondo de Empleados</p>
          <p className="mt-1">Sistema Seguro v2.0</p>
        </div>
        
      </div>
    </div>
  );
}
