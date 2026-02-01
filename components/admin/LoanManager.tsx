import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserProfile, Loan, LoanStatus } from '../../types';
import { ArrowLeft, AlertCircle, Briefcase, Plus } from 'lucide-react';

interface LoanManagerProps {
  users: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
}

export default function LoanManager({ users, onUpdateUsers }: LoanManagerProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = users.find(u => u.id === userId);

  if (!user) {
      return <div>Usuario no encontrado</div>;
  }

  const activeLoan = user.loans.find(l => l.status === LoanStatus.ACTIVE);

  const handleAssignLoan = (amount: number, term: number) => {
    const newLoan: Loan = {
      id: `L-${Date.now()}`,
      amount,
      remainingAmount: amount,
      interestRate: 1.5,
      termMonths: term,
      startDate: new Date().toISOString().split('T')[0],
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyPayment: (amount / term) + (amount * 0.015), // Simplified calc
      status: LoanStatus.ACTIVE,
      paymentsMade: 0
    };

    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, loans: [...u.loans, newLoan] } 
        : u
    );
    
    onUpdateUsers(updatedUsers);
    alert('Préstamo asignado correctamente');
    navigate('/admin');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <Link to="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {activeLoan ? 'Gestionar Préstamo' : 'Asignar Nuevo Préstamo'}
          </h2>
          <p className="text-sm text-slate-500">Usuario: {user.name}</p>
        </div>
      </div>

      <div className="p-6">
        {activeLoan ? (
          <div className="space-y-6">
             <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                <div className="flex items-start">
                   <AlertCircle className="text-orange-500 mt-0.5 mr-3" size={20} />
                   <div>
                      <h4 className="font-bold text-orange-800">Préstamo Activo Encontrado</h4>
                      <p className="text-sm text-orange-700 mt-1">
                         Este usuario ya tiene un crédito activo por <strong>${activeLoan.remainingAmount.toLocaleString()}</strong>.
                         No es posible asignar uno nuevo hasta que finalice el actual.
                      </p>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monto Original</span>
                    <p className="text-2xl font-bold text-slate-800">${activeLoan.amount.toLocaleString()}</p>
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Pendiente</span>
                    <p className="text-2xl font-bold text-slate-800">${activeLoan.remainingAmount.toLocaleString()}</p>
                </div>
             </div>

             {/* Placeholder for future actions */}
             <div className="pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">Acciones</h4>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium">
                        Registrar Abono Extra
                    </button>
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium">
                        Refinanciar
                    </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="max-w-md">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const validAmount = Number((form.elements.namedItem('amount') as HTMLInputElement).value);
                const validTerm = Number((form.elements.namedItem('term') as HTMLInputElement).value);
                handleAssignLoan(validAmount, validTerm);
              }} 
              className="space-y-6"
            >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monto del Préstamo</label>
                  <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                     <input 
                       name="amount"
                       type="number" 
                       required
                       className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                       placeholder="Ej: 1000000"
                     />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plazo (Meses)</label>
                  <input 
                     name="term"
                     type="number" 
                     required
                     defaultValue={12}
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                   <p>La tasa de interés se aplicará automáticamente al <strong>1.5% M.V.</strong></p>
                </div>

                <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center">
                   <Briefcase className="mr-2" size={20} />
                   Confirmar Asignación
                </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
