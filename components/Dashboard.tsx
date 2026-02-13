import React from 'react';
import { UserProfile } from '../types';
import { TrendingUp, Wallet, AlertCircle, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface DashboardProps {
  user: UserProfile;
}

const COLORS = ['#10b981', '#e2e8f0']; // Emerald for paid, Slate for remaining

export default function Dashboard({ user }: DashboardProps) {
  const totalDebt = user.loans.reduce((acc, loan) => acc + loan.remainingAmount, 0);
  
  // Calculate monthly deductions (Loan Payments + Savings Contribution)
  const totalLoanPayments = user.loans.reduce((acc, loan) => acc + loan.monthlyPayment, 0);
  const totalDeductions = totalLoanPayments + user.savings.monthlyContribution;

  // Prepare data for Savings Trend (Monthly Net + Projection)
  const savingsData = React.useMemo(() => {
    const monthlyNet = new Map<string, number>();
    user.savings.history.forEach(h => {
      const key = h.date.substring(0, 7); // YYYY-MM
      const current = monthlyNet.get(key) ?? 0;
      const delta = h.type === 'WITHDRAWAL' ? -h.amount : h.amount;
      monthlyNet.set(key, current + delta);
    });

    const months = Array.from(monthlyNet.keys()).sort();
    const lastKey = months.length > 0 ? months[months.length - 1] : new Date().toISOString().substring(0, 7);
    const [lastYear, lastMonth] = lastKey.split('-').map(Number);
    const lastDate = new Date(lastYear, lastMonth - 1, 1);

    const avgMonthlyNet = months.length > 0
      ? Array.from(monthlyNet.values()).reduce((s, v) => s + v, 0) / months.length
      : user.savings.monthlyContribution;

    const series = [];
    for (let i = -4; i <= 3; i++) {
      const d = new Date(lastDate);
      d.setMonth(lastDate.getMonth() + i);
      const key = d.toISOString().substring(0, 7);
      const isForecast = i > 0;
      const value = isForecast ? avgMonthlyNet : (monthlyNet.get(key) ?? 0);
      series.push({
        name: d.toLocaleDateString('es-ES', { month: 'short' }),
        amount: Math.round(value),
        type: isForecast ? 'forecast' : 'history',
        fullDate: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      });
    }
    return series;
  }, [user.savings.history, user.savings.monthlyContribution]);

  // Prepare data for Loan Progress (BarChart)
  const activeLoan = user.loans[0]; // Assuming single active loan for demo
  const loanProgressData = activeLoan ? [
    {
      name: 'Progreso',
      pagado: activeLoan.paymentsMade,
      pendiente: activeLoan.termMonths - activeLoan.paymentsMade,
    }
  ] : [];

  // Prepare data for Debt Composition (PieChart)
  const debtPieData = activeLoan ? [
    { name: 'Capital Pagado', value: activeLoan.amount - activeLoan.remainingAmount },
    { name: 'Saldo Pendiente', value: activeLoan.remainingAmount },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resumen Financiero</h2>
          <p className="text-slate-500">Detalle de tus ahorros, deudas y compromisos mensuales.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Actualizado hoy</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Ahorrado */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-50 to-transparent opacity-50"></div>
          <div className="relative z-10">
             <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Wallet size={24} />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full flex items-center">
                Ahorro
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Ahorrado</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">${user.savings.balance.toLocaleString()}</h3>
            <p className="text-sm text-emerald-600 mt-2 flex items-center font-medium">
              <TrendingUp size={16} className="mr-1" /> 
              +${user.savings.interestEarned.toLocaleString()} rendimientos
            </p>
          </div>
        </div>

        {/* Card 2: Deuda Total */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-50 to-transparent opacity-50"></div>
          <div className="relative z-10">
             <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <AlertCircle size={24} />
              </div>
              {totalDebt > 0 ? (
                <span className="text-xs font-medium px-2 py-1 bg-orange-50 text-orange-700 rounded-full flex items-center">
                  Activo
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                  Sin deuda
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500">Deuda Total</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">${totalDebt.toLocaleString()}</h3>
            {activeLoan && (
               <div className="flex items-center mt-2 text-sm text-slate-500">
                 <span className="mr-2">Próximo pago:</span>
                 <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{activeLoan.nextPaymentDate}</span>
               </div>
            )}
          </div>
        </div>

        {/* Card 3: Próximas Deducciones */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-50 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Calendar size={24} />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                Mensual
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">Próximas Deducciones</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">${totalDeductions.toLocaleString()}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ahorro:</span>
                <span className="font-medium">${user.savings.monthlyContribution.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Préstamos:</span>
                <span className="font-medium">${totalLoanPayments.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Savings Trend (AreaChart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tendencia de Ahorro</h3>
              <p className="text-sm text-slate-500">Último mes + 4 anteriores y proyección de 3 meses</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4'}}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                  labelFormatter={(label) => `Periodo: ${label}`}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {savingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'forecast' ? '#93c5fd' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Section: Loan Details */}
        <div className="space-y-6">
          {/* Loan Progress */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Progreso del Préstamo</h3>
            <p className="text-sm text-slate-500 mb-4">Cuotas pagadas vs. pendientes</p>
            
            {activeLoan ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm font-medium text-emerald-600">
                    <CheckCircle2 size={16} className="mr-1" />
                    {activeLoan.paymentsMade} Pagadas
                  </div>
                  <div className="text-sm text-slate-500">
                    {activeLoan.termMonths - activeLoan.paymentsMade} Pendientes
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                  <div 
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${(activeLoan.paymentsMade / activeLoan.termMonths) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Inicio: {activeLoan.startDate}</span>
                  <span>Fin: {activeLoan.termMonths} meses</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No tienes préstamos activos.</p>
            )}
          </div>

          {/* Debt Composition */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
             <h3 className="text-lg font-bold text-slate-800 mb-2">Estado de Deuda</h3>
             <div className="flex-1 min-h-[150px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={debtPieData}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" /> {/* Pagado */}
                      <Cell fill="#e2e8f0" /> {/* Pendiente */}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
