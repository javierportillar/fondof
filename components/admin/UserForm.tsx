import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserProfile, Role } from '../../types';
import { ArrowLeft, Save, UserPlus, AlertCircle } from 'lucide-react';

interface UserFormProps {
  users: UserProfile[];
  onAddUser: (user: UserProfile) => void;
}

export default function UserForm({ users, onAddUser }: UserFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const cedula = (formData.get('cedula') as string).trim();
    const email = (formData.get('email') as string).trim();
    const phone = (formData.get('phone') as string).trim();
    const initialSavings = Number(formData.get('initialSavings'));
    const creditLimit = Number(formData.get('creditLimit'));

    // Validation
    if (users.some(u => u.cedula === cedula)) {
        setError('Ya existe un usuario con esta cédula.');
        return;
    }

    const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        cedula,
        name,
        email,
        phoneNumber: phone,
        createdAt: new Date().toISOString().split('T')[0],
        role: Role.USER,
        creditLimit: creditLimit,
        savings: {
            balance: initialSavings,
            monthlyContribution: 0, // Default, can be edited later
            interestEarned: 0,
            lastContributionDate: '',
            history: initialSavings > 0 ? [{
                id: `txn-init-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                amount: initialSavings,
                type: 'DEPOSIT'
            }] : []
        },
        loans: []
    };

    onAddUser(newUser);
    navigate('/admin');
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
