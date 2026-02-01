import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types';
import { ArrowLeft, Save, X } from 'lucide-react';
import { SavingsService } from '../../services/savingsService';

interface SavingsFormProps {
  users: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
}

export default function SavingsForm({ users, onUpdateUsers }: SavingsFormProps) {
  const { userId, txnId } = useParams<{ userId: string; txnId?: string }>();
  const navigate = useNavigate();
  const user = users.find(u => u.id === userId);

  if (!user) return <div>Usuario no encontrado</div>;

  const editingTransaction = txnId ? user.savings.history.find(h => h.id === txnId) : null;
  const isEditing = !!txnId;

  if (isEditing && !editingTransaction) {
      return <div>Transacción no encontrada</div>;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const amount = Number((form.elements.namedItem('amount') as HTMLInputElement).value);
      const date = (form.elements.namedItem('date') as HTMLInputElement).value;

      if (amount > 0 && date) {
        let updatedUser;
        
        if (isEditing && editingTransaction) {
            updatedUser = SavingsService.updateContribution(user, editingTransaction.id, amount, date);
        } else {
            updatedUser = SavingsService.addContribution(user, amount, date);
        }

        // Update Global State
        const updatedUsers = users.map(u => 
            u.id === updatedUser.id ? updatedUser : u
        );
        onUpdateUsers(updatedUsers);
        
        navigate(`/admin/users/${userId}/savings`);
      }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
         <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <Link to={`/admin/users/${userId}/savings`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {isEditing ? 'Editar Transacción' : 'Registrar Nueva Consignación'}
                </h2>
                <p className="text-sm text-slate-500">Usuario: {user.name}</p>
            </div>
         </div>

         <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {isEditing && (
                    <div className="bg-orange-50 text-orange-800 p-4 rounded-lg flex items-start gap-3">
                         <div className="bg-orange-100 p-1 rounded">
                             <Edit2Icon size={16} className="text-orange-600" />
                         </div>
                         <div className="text-sm">
                             <p className="font-bold">Modo Edición</p>
                             <p>Estás modificando una transacción histórica. El saldo del usuario se recalculará automáticamente.</p>
                         </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Monto ($)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                        <input 
                            name="amount"
                            type="number" 
                            required
                            min="0"
                            defaultValue={editingTransaction ? editingTransaction.amount : ''}
                            className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-xl text-slate-800"
                            placeholder="0"
                            autoFocus
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de Transacción</label>
                    <input 
                        name="date"
                        type="date" 
                        required
                        defaultValue={editingTransaction ? editingTransaction.date : new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                     <Link 
                        to={`/admin/users/${userId}/savings`}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center"
                     >
                        <X size={20} className="mr-2" />
                        Cancelar
                     </Link>
                     <button 
                        type="submit" 
                        className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex justify-center items-center"
                     >
                        <Save size={20} className="mr-2" />
                        {isEditing ? 'Guardar Cambios' : 'Registrar Ahorro'}
                     </button>
                </div>
            </form>
         </div>
      </div>
    </div>
  );
}

function Edit2Icon(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    )
}
