import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../constants';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
  users: UserProfile[];
}

export default function LoginScreen({ onLogin, users }: LoginScreenProps) {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedCedula = cedula.trim();
    const user = users.find(u => u.cedula === trimmedCedula);

    if (user) {
      onLogin(user);
    } else {
      setError('Cédula no encontrada. Por favor verifique e intente nuevamente.');
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
          <p className="text-slate-500 mt-2">Ingresa tu número de cédula para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="cedula" className="block text-sm font-medium text-slate-700 mb-2">
              Número de Cédula
            </label>
            <input
              type="text"
              id="cedula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800 placeholder-slate-400"
              placeholder="Ej: 1234567890"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
          >
            Ingresar
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>FONDOF - Fondo de Empleados</p>
          <p className="mt-1">Sistema Seguro v2.0</p>
        </div>
        
        {/* Helper for demo purposes */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
             <p className="font-bold mb-2">Credenciales de Prueba:</p>
             <div className="flex justify-between mb-1">
                 <span>Admin:</span>
                 <span className="font-mono bg-slate-200 px-1 rounded">1234567890</span>
             </div>
             <div className="flex justify-between">
                 <span>Usuario:</span>
                 <span className="font-mono bg-slate-200 px-1 rounded">987654321</span>
             </div>
        </div>
      </div>
    </div>
  );
}
