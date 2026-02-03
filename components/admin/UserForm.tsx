import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Role } from '../../types';
import { AuthService } from '../../services';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function UserForm() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>(Role.USER);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const cedula = (formData.get('cedula') as string).trim();
    const email = (formData.get('email') as string).trim();
    const phone = (formData.get('phone') as string).trim();
    const password = (formData.get('password') as string).trim();
    const initialSavings = Number(formData.get('initialSavings'));
    const creditLimit = Number(formData.get('creditLimit'));

    try {
      console.log('[UserForm] Creating user (tabla users)', email);

      const signUpResult = await AuthService.signUp(email, password, {
        cedula,
        name,
        email,
        phone_number: phone,
        role,
        credit_limit: creditLimit
      });

      const newUserId = signUpResult.profile?.id;
      if (!newUserId) throw new Error('No se obtuvo el ID del usuario creado.');

      if (initialSavings > 0) {
        await supabase.from('savings_accounts').upsert([{
          user_id: newUserId,
          balance: initialSavings
        }]);
        await supabase.from('savings_history').insert([{
          user_id: newUserId,
          amount: initialSavings,
          type: 'DEPOSIT'
        }]);
      }

      console.log('[UserForm] User created successfully');
      navigate('/admin');
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
         <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Registrar Nuevo Asociado</h2>
                <p className="text-sm text-slate-500">Crea un nuevo perfil de usuario en la plataforma</p>
            </div>
         </div>

         <div className="p-8">
            {error && (
                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center text-sm">
                    <AlertCircle size={18} className="mr-2" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
                    <input name="name" type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: Juan Pérez" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cédula (ID)</label>
                        <input name="cedula" type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: 123456789" />
                        <p className="text-xs text-slate-400 mt-1">Este será el usuario para ingresar.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Celular / Teléfono</label>
                        <input name="phone" type="tel" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: 300 123 4567" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                    <input name="email" type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="correo@ejemplo.com" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Rol</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as Role)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value={Role.USER}>Usuario</option>
                          <option value={Role.ADMIN}>Administrador</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
                        <div className="relative">
                          <input 
                            name="password" 
                            type={showPassword ? 'text' : 'password'} 
                            required 
                            minLength={6}
                            className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="Mínimo 6 caracteres" 
                            autoComplete="new-password"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-emerald-700 mb-4 uppercase tracking-wide">Configuración Financiera Inicial</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Ahorro Inicial (Opcional)</label>
                            <input name="initialSavings" type="number" min="0" defaultValue="0" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Cupo de Crédito</label>
                            <input name="creditLimit" type="number" min="0" defaultValue="1000000" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                     <Link 
                        to="/admin"
                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center"
                     >
                        Cancelar
                     </Link>
                     <button 
                        type="submit" 
                        className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex justify-center items-center"
                     >
                        <UserPlus size={20} className="mr-2" />
                        Crear Usuario
                     </button>
                </div>
            </form>
         </div>
      </div>
    </div>
  );
}
