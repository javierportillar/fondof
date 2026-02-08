import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, SavingsGoal } from '../types';
import { ArrowUpRight, Target, TrendingUp, ArrowDownLeft, Plus, Edit2, Save, X, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UsersService } from '../services';

interface SavingsSectionProps {
  user: UserProfile;
  onUpdateUser?: (user: UserProfile) => void;
}

export default function SavingsSection({ user, onUpdateUser }: SavingsSectionProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goal, setGoal] = useState<SavingsGoal | undefined>(user.savingsGoal);
  
  // Goal Form State
  const [goalName, setGoalName] = useState(user.savingsGoal?.name || '');
  const [goalAmount, setGoalAmount] = useState(user.savingsGoal?.targetAmount?.toString() || '');

  useEffect(() => {
    setGoal(user.savingsGoal);
    setGoalName(user.savingsGoal?.name || '');
    setGoalAmount(user.savingsGoal?.targetAmount?.toString() || '');
  }, [user.savingsGoal?.name, user.savingsGoal?.targetAmount, user.savingsGoal?.createdAt]);

  // 1. Chart Data Processing (Aggregate by Month)
  const chartData = useMemo(() => {
    const monthMap = new Map<string, { dateObj: Date, balance: number, deposit: number }>();
    
    // Sort history chronologically
    const sortedHistory = [...user.savings.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;

    // Process all history
    sortedHistory.forEach(h => {
        if (h.type === 'WITHDRAWAL') {
            runningBalance -= h.amount;
        } else {
            runningBalance += h.amount;
        }

        const [year, month] = h.date.split('-');
        const key = `${year}-${month}`;
        
        monthMap.set(key, {
            dateObj: new Date(Number(year), Number(month) - 1, 1),
            balance: runningBalance,
            deposit: h.type === 'DEPOSIT' ? h.amount : 0 
        });
    });

    const historyData = Array.from(monthMap.entries()).map(([key, value]) => ({
        name: value.dateObj.toLocaleDateString('es-ES', { month: 'short' }),
        fullName: value.dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        balance: value.balance,
        type: 'history',
        fullDate: key // YYYY-MM
    }));

    // Forecast Data
    const lastBalance = historyData.length > 0 ? historyData[historyData.length - 1].balance : 0;
    const lastDate = historyData.length > 0 ? new Date(monthMap.get(historyData[historyData.length - 1].fullDate)!.dateObj) : new Date();
    
    const forecastData = [];
    let projectedBalance = lastBalance;

    for (let i = 1; i <= 6; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + i);
        projectedBalance += user.savings.monthlyContribution;

        forecastData.push({
            name: nextDate.toLocaleDateString('es-ES', { month: 'short' }),
            fullName: nextDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            balance: projectedBalance,
            type: 'forecast',
            fullDate: nextDate.toISOString().split('T')[0]
        });
    }

    return [...historyData, ...forecastData];
  }, [user.savings.history, user.savings.monthlyContribution]);

  // 2. Yearly Summary Logic
  const yearlySummary = useMemo(() => {
    const summary: Record<string, { savings: number, withdrawals: number, balance: number }> = {};
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
      summary[year].balance = runningBalance;
    });

    return Object.entries(summary).map(([year, data]) => ({
      year,
      ...data
    })).sort((a, b) => Number(b.year) - Number(a.year));
  }, [user.savings.history]);

  // 3. Goal & Forecasting Logic
  const goalStats = useMemo(() => {
    if (!goal) return null;

    const currentBalance = user.savings.balance;
    const target = goal.targetAmount;
    const progress = Math.min(100, Math.max(0, (currentBalance / target) * 100));
    
    // Calculate Average Monthly Savings based on history
    const deposits = user.savings.history.filter(h => h.type === 'DEPOSIT');
    const totalDeposited = deposits.reduce((sum, h) => sum + h.amount, 0);
    const uniqueMonths = new Set(deposits.map(h => h.date.substring(0, 7))).size; // "YYYY-MM"
    
    // Use average or fall back to current configured contribution if no history
    const avgSavings = uniqueMonths > 0 ? (totalDeposited / uniqueMonths) : user.savings.monthlyContribution;
    const effectiveSavingsRate = avgSavings > 0 ? avgSavings : 1; // Prevent div by zero

    const remainingAmount = Math.max(0, target - currentBalance);
    const monthsToGoal = Math.ceil(remainingAmount / effectiveSavingsRate);
    
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + monthsToGoal);

    return {
        progress,
        remainingAmount,
        monthsToGoal,
        estimatedDate,
        effectiveSavingsRate
    };
  }, [goal, user.savings.balance, user.savings.history, user.savings.monthlyContribution]);

  const handleSaveGoal = async () => {
    if (!goalName.trim() || !goalAmount || Number(goalAmount) <= 0) return;

    try {
      setSavingGoal(true);
      setGoalError(null);
      const data = await UsersService.setSavingsGoal(user.id, {
        name: goalName.trim(),
        target_amount: Number(goalAmount)
      });
      const savedGoal: SavingsGoal = {
        name: data.name,
        targetAmount: data.target_amount,
        createdAt: data.created_at
      };
      setGoal(savedGoal);
      if (onUpdateUser) {
        onUpdateUser({ ...user, savingsGoal: savedGoal });
      }
      setIsEditingGoal(false);
    } catch (e: any) {
      setGoalError(e?.message || 'No se pudo guardar la meta');
    } finally {
      setSavingGoal(false);
    }
  };

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
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  formatter={(value: number, name: string, props: any) => {
                      const additional = props.payload.type === 'forecast' ? '(Proyección)' : '';
                      return [`$${value.toLocaleString()} ${additional}`, 'Capital Acumulado'];
                  }}
                  labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                          return payload[0].payload.fullName || label;
                      }
                      return label;
                  }}
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

        {/* Goal Widget */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Target size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">Meta de Ahorro</h3>
                    </div>
                </div>

                {/* EDIT MODE / CREATE MODE */}
                {(isEditingGoal || !goal) ? (
                    <div className="flex-1 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200">
                         {!goal && !isEditingGoal ? (
                             // Empty State
                             <div className="text-center py-6">
                                 <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                     <Target size={32} />
                                 </div>
                                 <p className="text-slate-500 mb-4">No tienes una meta definida</p>
                                 <button 
                                    onClick={() => setIsEditingGoal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center mx-auto"
                                 >
                                     <Plus size={16} className="mr-1" />
                                     Crear Meta
                                 </button>
                             </div>
                         ) : (
                             // Edit/Create Form
                             <div className="space-y-4">
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la Meta</label>
                                     <input 
                                        type="text" 
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="Ej: Viaje, Carro, Casa..."
                                        value={goalName}
                                        onChange={(e) => setGoalName(e.target.value)}
                                     />
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase">Monto Objetivo ($)</label>
                                     <input 
                                        type="number" 
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="0"
                                        value={goalAmount}
                                        onChange={(e) => setGoalAmount(e.target.value)}
                                     />
                                 </div>
                                 {goalError && (
                                     <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded">
                                         {goalError}
                                     </div>
                                 )}
                                 <div className="flex gap-2 pt-2">
                                     <button 
                                        onClick={handleSaveGoal}
                                        disabled={savingGoal}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex justify-center items-center disabled:opacity-60"
                                     >
                                         <Save size={16} className="mr-1" /> Guardar
                                     </button>
                                     {goal && (
                                         <button 
                                            onClick={() => {
                                                setGoalName(goal?.name || '');
                                                setGoalAmount(goal?.targetAmount?.toString() || '');
                                                setIsEditingGoal(false);
                                            }}
                                            className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex justify-center items-center"
                                         >
                                             <X size={16} className="mr-1" /> Cancelar
                                         </button>
                                     )}
                                 </div>
                             </div>
                         )}
                    </div>
                ) : (
                    // VIEW MODE
                    <div className="flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-slate-500">Objetivo</p>
                                    <h4 className="font-bold text-lg text-slate-800">{goal?.name}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Meta</p>
                                    <p className="font-bold text-lg text-blue-600">${goal?.targetAmount.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div 
                                    className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${goalStats?.progress}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-blue-600">{goalStats?.progress.toFixed(1)}% Logrado</span>
                                <span className="text-slate-400">Faltan ${goalStats?.remainingAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {goalStats?.remainingAmount > 0 ? (
                            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <Calendar className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Proyección</p>
                                        <p className="text-sm text-blue-900 leading-relaxed">
                                            Ahorrando el promedio de <b>${goalStats.effectiveSavingsRate.toLocaleString()}</b> mensuales, cumplirás tu meta en:
                                        </p>
                                        <p className="text-lg font-bold text-blue-700 mt-1 capitalize">
                                            {goalStats.estimatedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="mt-6 bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                                <p className="font-bold text-green-700">¡Meta Cumplida!</p>
                                <p className="text-sm text-green-600">Has alcanzado tu objetivo.</p>
                             </div>
                        )}

                        <button 
                            onClick={() => {
                                if (!goal) return;
                                setGoalName(goal.name);
                                setGoalAmount(goal.targetAmount.toString());
                                setIsEditingGoal(true);
                            }}
                            className="w-full mt-4 border border-slate-200 text-slate-600 font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center text-sm"
                        >
                            <Edit2 size={14} className="mr-2" /> Editar Meta
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Yearly Summary Table (Full Width) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Historial de Ahorro</h3>
          <p className="text-slate-500 text-sm">Detalle por año, mes y día.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Año</th>
                <th className="px-6 py-4 text-left">Mes</th>
                <th className="px-6 py-4 text-left">Día</th>
                <th className="px-6 py-4 text-left">Tipo</th>
                <th className="px-6 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {user.savings.history
                .slice()
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((h) => {
                  const [year, month, day] = h.date.split('-');
                  return (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{year}</td>
                      <td className="px-6 py-4 text-slate-700 capitalize">
                        {new Date(Number(year), Number(month) - 1).toLocaleString('es-ES', { month: 'long' })}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{day}</td>
                      <td className="px-6 py-4 text-slate-500 capitalize">
                        {h.type === 'DEPOSIT' ? 'Depósito' : h.type === 'WITHDRAWAL' ? 'Retiro' : 'Interés'}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${
                        h.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-emerald-600'
                      }`}>
                        {h.type === 'WITHDRAWAL' ? '-' : '+'}${h.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
