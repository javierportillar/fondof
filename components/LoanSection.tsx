import React from 'react';
import { UserProfile } from '../types';
import { Calendar, FileText, CheckCircle } from 'lucide-react';

interface LoanSectionProps {
  user: UserProfile;
}

export default function LoanSection({ user }: LoanSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Préstamos</h2>
          <p className="text-slate-500">Gestiona y visualiza el estado de tus créditos.</p>
        </div>
        <button className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Solicitar Nuevo Crédito
        </button>
      </div>

      {user.loans.map((loan) => (
        <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Loan Header */}
          <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <FileText className="text-emerald-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Préstamo Libre Inversión</h3>
                <p className="text-sm text-slate-500">ID: {loan.id}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {loan.status}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Monto Original</p>
              <p className="text-lg font-bold text-slate-800">${loan.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Saldo Pendiente</p>
              <p className="text-lg font-bold text-slate-800">${loan.remainingAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Tasa Interés</p>
              <p className="text-lg font-bold text-slate-800">{loan.interestRate}% M.V.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Cuota Mensual</p>
              <p className="text-lg font-bold text-slate-800">${loan.monthlyPayment.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Progreso de Pago</span>
              <span className="font-semibold text-emerald-600">
                {Math.round(((loan.amount - loan.remainingAmount) / loan.amount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((loan.amount - loan.remainingAmount) / loan.amount) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Payment Schedule Table (Mock) */}
          <div className="border-t border-slate-100">
            <div className="p-6">
              <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                <Calendar className="mr-2" size={18} /> Próximos Pagos
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg"># Cuota</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Capital</th>
                      <th className="px-4 py-3">Interés</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3 rounded-r-lg">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">6</td>
                      <td className="px-4 py-3">{loan.nextPaymentDate}</td>
                      <td className="px-4 py-3">${(loan.monthlyPayment * 0.7).toLocaleString()}</td>
                      <td className="px-4 py-3">${(loan.monthlyPayment * 0.3).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">${loan.monthlyPayment.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className="text-orange-500 font-medium">Pendiente</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 opacity-60">
                      <td className="px-4 py-3 font-medium text-slate-700">5</td>
                      <td className="px-4 py-3">2023-10-15</td>
                      <td className="px-4 py-3">${(loan.monthlyPayment * 0.7).toLocaleString()}</td>
                      <td className="px-4 py-3">${(loan.monthlyPayment * 0.3).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">${loan.monthlyPayment.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center text-emerald-600 font-medium">
                          <CheckCircle size={14} className="mr-1" /> Pagado
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}