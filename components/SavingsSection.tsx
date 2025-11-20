import React from 'react';
import { UserProfile } from '../types';
import { ArrowUpRight, Target, History } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SavingsSectionProps {
  user: UserProfile;
}

export default function SavingsSection({ user }: SavingsSectionProps) {
  const chartData = user.savings.history.slice().reverse().map(h => ({
    name: new Date(h.date).toLocaleDateString('es-ES', { month: 'short' }),
    amount: h.amount,
    fullDate: h.date
  }));

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Ahorro Programado</h2>
        <p className="text-slate-500">Tu fondo para el futuro crece mes a mes.</p>
      </div>

      {/* Summary Card */}
      <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <p className="text-emerald-100 font-medium mb-2">Balance Actual</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">${user.savings.balance.toLocaleString()}</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-emerald-700/50 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-emerald-100 mb-1">Aporte Mensual</p>
              <p className="font-bold text-xl">${user.savings.monthlyContribution.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-700/50 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-emerald-100 mb-1">Intereses Generados</p>
              <p className="font-bold text-xl flex items-center">
                <ArrowUpRight size={18} className="mr-1" /> 
                ${user.savings.interestEarned.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Historial de Crecimiento</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions & Goal */}
        <div className="space-y-6">
            {/* Goal Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Target size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800">Meta de Ahorro</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Objetivo: Casa Propia</span>
                        <span className="font-bold text-slate-800">$5.000.000</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-1/4"></div>
                    </div>
                    <p className="text-xs text-slate-400 text-right">25% completado</p>
                </div>
                <button className="w-full mt-4 border border-slate-200 text-slate-600 font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    Editar Meta
                </button>
            </div>
            
            {/* Recent History List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <History size={18} className="mr-2 text-slate-400" /> Últimos Movimientos
                </h3>
                <div className="space-y-4">
                    {user.savings.history.slice(0, 4).map((h, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                            <div>
                                <p className="font-medium text-slate-700">
                                    {h.type === 'DEPOSIT' ? 'Abono Mensual' : 'Rendimientos'}
                                </p>
                                <p className="text-slate-400 text-xs">{h.date}</p>
                            </div>
                            <span className={`font-bold ${h.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                +${h.amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}