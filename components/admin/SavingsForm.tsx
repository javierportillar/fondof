import React, { useState } from 'react'; // Added useState
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { UserProfile } from '../../types';
import { ArrowLeft, Save, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'; // Added icons
import { SavingsService } from '../../services/savingsService';

interface SavingsFormProps {
  users: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
}

export default function SavingsForm({ users, onUpdateUsers }: SavingsFormProps) {
  const { userId, txnId } = useParams<{ userId: string; txnId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = users.find(u => u.id === userId);

  // Determine initial type from location state or existing transaction
  const locationState = location.state as { defaultType?: 'DEPOSIT' | 'WITHDRAWAL' } | null;
  const editingTransaction = txnId ? user?.savings.history.find(h => h.id === txnId) : null;
  const initialType = editingTransaction?.type === 'WITHDRAWAL' ? 'WITHDRAWAL' : (locationState?.defaultType || 'DEPOSIT');

  const [transactionType, setTransactionType] = useState<'DEPOSIT' | 'WITHDRAWAL'>(initialType);
  const isEditing = !!txnId;

  if (!user) return <div>Usuario no encontrado</div>;
  if (isEditing && !editingTransaction) return <div>Transacción no encontrada</div>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const amount = Number((form.elements.namedItem('amount') as HTMLInputElement).value);
      const date = (form.elements.namedItem('date') as HTMLInputElement).value;

      if (amount > 0 && date) {
        let updatedUser;
        
        if (isEditing && editingTransaction) {
            // Note: Currently updateContribution assumes deposits or generic editing. 
            // If type change is needed, it's more complex. Ideally forbid changing type on edit for simplicity.
            updatedUser = SavingsService.updateContribution(user, editingTransaction.id, amount, date);
        } else {
            if (transactionType === 'DEPOSIT') {
                updatedUser = SavingsService.addContribution(user, amount, date);
            } else {
                 updatedUser = SavingsService.addWithdrawal(user, amount, date);
            }
        }

        // Update Global State
        const updatedUsers = users.map(u => 
            u.id === updatedUser.id ? updatedUser : u
        );
        onUpdateUsers(updatedUsers);
        
        navigate(`/admin/users/${userId}/savings`);
      }
  };

  const isDeposit = transactionType === 'DEPOSIT';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
         <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <Link to={`/admin/users/${userId}/savings`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {isEditing ? 'Editar Transacción' : (isDeposit ? 'Registrar Nueva Consignación' : 'Registrar Nuevo Retiro')}
                </h2>
                <p className="text-sm text-slate-500">Usuario: {user.name}</p>
            </div>
         </div>

         <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Type Selector (Only on Create) */}
                {!isEditing && (
                    <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setTransactionType('DEPOSIT')}
                            className={`flex items-center justify-center py-3 rounded-lg font-bold text-sm transition-all ${
                                isDeposit 
                                ? 'bg-white text-emerald-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <ArrowUpCircle size={18} className="mr-2" />
                            Consignación
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransactionType('WITHDRAWAL')}
                            className={`flex items-center justify-center py-3 rounded-lg font-bold text-sm transition-all ${
                                !isDeposit 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <ArrowDownCircle size={18} className="mr-2" />
                            Retiro
                        </button>
                    </div>
                )}

                {isEditing && (
                    <div className="bg-orange-50 text-orange-800 p-4 rounded-lg flex items-start gap-3">
                         <div className="bg-orange-100 p-1 rounded">
                             <Edit2Icon size={16} className="text-orange-600" />
                         </div>
                         <div className="text-sm">
                             <p className="font-bold">Modo Edición</p>
                             <p>Estás modificando una transacción histórica.</p>
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
                            className={`w-full pl-10 pr-4 py-4 bg-slate-50 border rounded-xl focus:ring-2 outline-none font-bold text-xl text-slate-800 ${
                                isDeposit 
                                ? 'border-slate-200 focus:ring-emerald-500' 
                                : 'border-red-100 focus:ring-red-500 focus:border-red-200'
                            }`}
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
                        className={`flex-[2] py-4 text-white font-bold rounded-xl transition-colors shadow-lg flex justify-center items-center ${
                            isDeposit
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                            : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                        }`}
                     >
                        <Save size={20} className="mr-2" />
                        {isEditing ? 'Guardar Cambios' : (isDeposit ? 'Registrar Ahorro' : 'Confirmar Retiro')}
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
