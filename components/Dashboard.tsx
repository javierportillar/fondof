import React from 'react';
import { UserProfile } from '../types';
import { TrendingUp, CreditCard, AlertCircle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  user: UserProfile;
}

const COLORS = ['#059669', '#e2e8f0'];

export default function Dashboard({ user }: DashboardProps) {
  const totalDebt = user.loans.reduce((acc, loan) => acc + loan.remainingAmount, 0);
  const creditUtilization = (totalDebt / user.creditLimit) * 100;

  const savingsData = user.savings.history.slice(0, 5).reverse().map(h => ({
    name: new Date(h.date).toLocaleDateString('es-ES', { month: 'short' }),
    amount: h.amount
  }));

  const loanPieData = [
    { name: 'Pagado', value: user.loans[0].amount - user.loans[0].remainingAmount },
    { name: 'Pendiente', value: user.loans[0].remainingAmount },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Hola, {user.name} 👋</h2>
        <p className="text-slate-500">Aquí tienes el resumen de tus finanzas hoy.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Ahorro Total</p>
            <h3 className="text-2xl font-bold text-emerald-600">${user.savings.balance.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 mt-2 flex items-center">
              <TrendingUp size={14} className="mr-1" /> +{user.savings.interestEarned.toLocaleString()} intereses ganados
            </p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-lg">
            <DollarSign className="text-emerald-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Deuda Activa</p>
            <h3 className="text-2xl font-bold text-slate-800">${totalDebt.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-2">Próximo pago: {user.loans[0]?.nextPaymentDate}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <AlertCircle className="text-orange-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Cupo Disponible</p>
            <h3 className="text-2xl font-bold text-blue-600">${(user.creditLimit - totalDebt).toLocaleString()}</h3>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${Math.min(creditUtilization, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <CreditCard className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Growth */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Crecimiento de Ahorros</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f0fdf4'}}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Estado del Préstamo Actual</h3>
          <div className="h-64 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loanPieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {loanPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute text-center">
               <p className="text-xs text-slate-500">Pagado</p>
               <p className="text-xl font-bold text-emerald-600">
                 {Math.round(((user.loans[0].amount - user.loans[0].remainingAmount) / user.loans[0].amount) * 100)}%
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}