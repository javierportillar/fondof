import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserProfile, Role } from '../../types';
import { ArrowLeft, PiggyBank, Calendar, Edit2, Plus } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SavingsService } from '../../services/savingsService';
import { supabase } from '../../lib/supabase';

export default function SavingsManager() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userId) throw new Error('Falta userId');
        const { data: userData, error: userErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        if (userErr) throw userErr;

        const { data: savingsAcc } = await supabase
          .from('savings_accounts')
          .select('*')
          .eq('user_id', userId)
          .single();

        const { data: historyData } = await supabase
          .from('savings_history')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        const profile: UserProfile = {
          id: userData.id,
          cedula: userData.cedula,
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phone_number,
          createdAt: userData.created_at,
          role: userData.role === 'ADMIN' ? Role.ADMIN : Role.USER,
          creditLimit: userData.credit_limit ?? 0,
          savings: savingsAcc ? {
            balance: savingsAcc.balance ?? 0,
            monthlyContribution: savingsAcc.monthly_contribution ?? 0,
            lastContributionDate: savingsAcc.last_contribution_date || '',
            interestEarned: savingsAcc.interest_earned ?? 0,
            history: (historyData || []).map(h => ({
              id: h.id,
              date: h.date,
              amount: h.amount,
              type: h.type
            }))
          } : {
            balance: 0,
            monthlyContribution: 0,
            lastContributionDate: '',
            interestEarned: 0,
            history: (historyData || []).map(h => ({
              id: h.id,
              date: h.date,
              amount: h.amount,
              type: h.type
            }))
          },
          loans: [],
          savingsGoal: undefined
        };
        setUser(profile);
      } catch (e: any) {
        setError(e.message || 'No se pudo cargar el usuario.');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>Usuario no encontrado</div>;


  const chartData = SavingsService.getMonthlySavingsData(user.savings.history);

  // Date Formatter Helper
  const formatDateSafe = (dateStr: string) => {
    try {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
         <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link to="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Gestionar Ahorros</h2>
                    <p className="text-sm text-slate-500">Usuario: {user.name}</p>
                </div>
            </div>
            
            <div className="flex gap-3">
                <Link 
                    to={`/admin/users/${userId}/savings/new`}
                    state={{ defaultType: 'WITHDRAWAL' }}
                    className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold flex items-center shadow-sm hover:bg-red-50 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Registrar Retiro
                </Link>
                <Link 
                    to={`/admin/users/${userId}/savings/new`}
                    state={{ defaultType: 'DEPOSIT' }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Registrar Consignación
                </Link>
            </div>
        </div>

        <div className="p-6">
           {/* Top Stats & Chart */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
               
               {/* Balance Card */}
               <div className="bg-emerald-50 rounded-2xl p-6 flex flex-col justify-between">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm">
                          <PiggyBank size={28} />
                      </div>
                      <span className="text-sm font-medium text-emerald-800">Saldo Total</span>
                   </div>
                   <div>
                      <h3 className="text-4xl font-bold text-emerald-900">${user.savings.balance.toLocaleString()}</h3>
                      <p className="text-emerald-700 text-sm mt-1">
                        +${user.savings.interestEarned.toLocaleString()} Rendimientos
                      </p>
                   </div>
               </div>

               {/* Chart */}
               <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 text-sm">Comportamiento Mensual (Depósitos)</h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#64748b', fontSize: 12}} 
                          dy={10}
                        />
                        <YAxis 
                          hide
                        />
                        <Tooltip 
                          cursor={{fill: '#f1f5f9'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Aporte']}
                        />
                        <Bar 
                          dataKey="amount" 
                          fill="#10b981" 
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
           </div>

           {/* History List */}
           <div>
              <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                 <Calendar size={18} className="mr-2 text-slate-400" />
                 Historial de Transacciones
              </h4>
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                  {user.savings.history.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-4">No hay movimientos registrados</p>
                  )}
                  {user.savings.history.map((h, i) => (
                      <div key={i} className="flex justify-between items-center text-sm p-3 bg-white rounded-lg shadow-sm border border-slate-100 group">
                          <div className="flex flex-col">
                            <span className="text-slate-700 font-medium capitalize">{formatDateSafe(h.date)}</span>
                            <span className="text-xs text-slate-400 capitalize">{h.type === 'DEPOSIT' ? 'Consignación' : h.type === 'WITHDRAWAL' ? 'Retiro' : 'Interés'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className={`font-bold ${
                                h.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-emerald-600'
                              }`}>
                                {h.type === 'WITHDRAWAL' ? '-' : '+'}${h.amount.toLocaleString()}
                              </span>
                              {/* Edit Button (Link to Edit Route) */}
                              {h.type === 'DEPOSIT' && (
                                 <Link 
                                   to={`/admin/users/${userId}/savings/edit/${h.id}`}
                                   className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded transition-all text-slate-500"
                                   title="Editar Movimiento"
                                 >
                                     <Edit2 size={14} />
                                 </Link>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
           </div>
        </div>
    </div>
  );
}
