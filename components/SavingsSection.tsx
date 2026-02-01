import React, { useMemo } from 'react';
import { UserProfile } from '../types';
import { ArrowUpRight, Target, TrendingUp, ArrowDownLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SavingsSectionProps {
  user: UserProfile;
}

export default function SavingsSection({ user }: SavingsSectionProps) {
  
  // 1. Historical Data Processing for Chart
  const historicalData = useMemo(() => {
    return user.savings.history.slice().reverse().map(h => ({
      name: new Date(h.date).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      amount: h.amount,
      balance: 0, // Calculated below
      type: 'history',
      fullDate: h.date
    }));
  }, [user.savings.history]);

  // Calculate running balance for chart
  const balanceHistory = useMemo(() => {
    const sortedHistory = [...user.savings.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Reconstruct balance history
    // We assume the current balance is correct. 
    // To get historical balances, we could work backwards or forwards.
    // Let's assume the sum of all history + initial = current.
    // For simplicity in this view, let's just show the accumulation of the history provided.
    
    let runningBalance = 0;
    return sortedHistory.map(h => {
      if (h.type === 'WITHDRAWAL') {
        runningBalance -= h.amount;
      } else {
        runningBalance += h.amount;
      }
      return {
        name: new Date(h.date).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        balance: runningBalance,
        type: 'history',
        fullDate: h.date
      };
    });
  }, [user.savings.history]);

  // 2. Forecast Data
  const forecastData = useMemo(() => {
    const lastDate = new Date();
    const data = [];
    // Start forecast from current real balance
    let projectedBalance = user.savings.balance;

    for (let i = 1; i <= 6; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(lastDate.getMonth() + i);
      projectedBalance += user.savings.monthlyContribution;
      
      data.push({
        name: nextDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        balance: projectedBalance,
        type: 'forecast',
        fullDate: nextDate.toISOString().split('T')[0]
      });
    }
    return data;
  }, [user.savings.balance, user.savings.monthlyContribution]);

  const combinedChartData = [...balanceHistory, ...forecastData];

  // 3. Yearly Summary Logic
  const yearlySummary = useMemo(() => {
    const summary: Record<string, { savings: number, withdrawals: number, balance: number }> = {};
    
    // Sort history chronologically
    const sortedHistory = [...user.savings.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;

    sortedHistory.forEach(h => {
      const year = new Date(h.date).getFullYear().toString();
      if (!summary[year]) {
        summary[year] = { savings: 0, withdrawals: 0, balance: 0 };
      }

      if (h.type === 'WITHDRAWAL') {
        summary[year].withdrawals += h.amount;
        runningBalance -= h.amount;
      } else {
        summary[year].savings += h.amount;
        runningBalance += h.amount;
      }
      
      // Update the closing balance for the year (this will be overwritten until the last transaction of the year)
      // Ideally, we want the balance at the END of the year.
      // Since we are iterating chronologically, the runningBalance at any point is the balance after that transaction.
      // So we just keep updating it.
      summary[year].balance = runningBalance;
    });

    return Object.entries(summary).map(([year, data]) => ({
      year,
      ...data
    })).sort((a, b) => Number(b.year) - Number(a.year)); // Descending year
  }, [user.savings.history]);

  const monthsContributed = user.savings.history.filter(h => h.type === 'DEPOSIT').length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Ahorro Programado</h2>
        <p className="text-slate-500">Gestiona y proyecta tu futuro financiero.</p>
      </div>

      {/* Summary Card */}
      <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 font-medium mb-2">Balance Total Ahorrado</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">${user.savings.balance.toLocaleString()}</h1>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
               <div className="text-center">
                 <p className="text-xs text-emerald-100 uppercase tracking-wider font-bold">Meses Aportados</p>
                 <p className="text-3xl font-bold">{monthsContributed}</p>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-emerald-700/50 p-4 rounded-lg backdrop-blur-sm flex-1">
              <p className="text-sm text-emerald-100 mb-1">Aporte Mensual Actual</p>
              <p className="font-bold text-xl">${user.savings.monthlyContribution.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-700/50 p-4 rounded-lg backdrop-blur-sm flex-1">
              <p className="text-sm text-emerald-100 mb-1">Rendimientos Totales</p>
              <p className="font-bold text-xl flex items-center">
                <ArrowUpRight size={18} className="mr-1" /> 
                ${user.savings.interestEarned.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <TrendingUp className="mr-2 text-emerald-600" size={20} />
              Proyección de Ahorro
            </h3>
            <div className="flex items-center text-xs space-x-3">
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></span> Histórico</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-300 mr-1 border border-emerald-500 border-dashed"></span> Proyección (6 meses)</span>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorHistory)" 
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Widget (Moved to side, kept simple) */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
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
        </div>
      </div>

      {/* Yearly Summary Table (Full Width) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Historial de Ahorro</h3>
          <p className="text-slate-500 text-sm">Resumen anual de tus movimientos financieros.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Año</th>
                <th className="px-6 py-4 text-right text-emerald-600">Ahorro (Depósitos + Interés)</th>
                <th className="px-6 py-4 text-right text-red-500">Retiros</th>
                <th className="px-6 py-4 text-right">Balance Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {yearlySummary.map((item) => (
                <tr key={item.year} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.year}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-medium flex justify-end items-center gap-1">
                    <ArrowUpRight size={14} />
                    ${item.savings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-red-500 font-medium">
                    {item.withdrawals > 0 ? (
                      <span className="flex justify-end items-center gap-1">
                        <ArrowDownLeft size={14} />
                        -${item.withdrawals.toLocaleString()}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    ${item.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}