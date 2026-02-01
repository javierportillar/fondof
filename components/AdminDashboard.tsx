import React, { useState, useEffect } from 'react';
import { UserProfile, Product, Role, LoanStatus, Loan } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { 
  Users, 
  ShoppingBag, 
  Search, 
  DollarSign, 
  Edit2, 
  Save, 
  X, 
  LogOut, 
  Check, 
  Briefcase, 
  PiggyBank, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SavingsService } from '../services/savingsService';

interface AdminDashboardProps {
  user: UserProfile;
  users: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  onLogout: () => void;
}

type ViewMode = 'LIST' | 'MANAGE_LOAN' | 'MANAGE_SAVINGS';

export default function AdminDashboard({ user, users, onUpdateUsers, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('users');
  const [localProducts, setLocalProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');

  // User Management State
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Savings Edit State
  const [editingSavingsId, setEditingSavingsId] = useState<string | null>(null);

  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  // Derived State
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  // Filter Helpers
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.cedula.includes(searchTerm)
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredProducts = localProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm({ ...product });
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    
    setLocalProducts(prev => prev.map(p => 
      p.id === editingProduct ? { ...p, ...editForm } as Product : p
    ));
    setEditingProduct(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  // User Management Handlers
  const openUserManagement = (userId: string, mode: ViewMode) => {
    setSelectedUserId(userId);
    setViewMode(mode);
    setEditingSavingsId(null); // Reset details
  };

  const handleBackToList = () => {
    setViewMode('LIST');
    setSelectedUserId(null);
    setEditingSavingsId(null);
  };

  const handleAssignLoan = (amount: number, term: number) => {
    if (!selectedUser) return;

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
      u.id === selectedUser.id 
        ? { ...u, loans: [...u.loans, newLoan] } 
        : u
    );
    
    onUpdateUsers(updatedUsers);
    alert('Préstamo asignado correctamente');
    handleBackToList();
  };

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

  /* --------------------------------------------------------------------------------
   * Sub-View: User List
   * -------------------------------------------------------------------------------- */
  const renderUserList = () => (
    <div className="space-y-4">
      {paginatedUsers.map(u => (
        <div key={u.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* User Info Column */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold ${
                u.role === Role.ADMIN ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {u.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{u.name}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                  <span className="flex items-center">
                     <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mr-1">CC</span>
                     {u.cedula}
                  </span>
                  <span className="hidden md:inline">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    u.role === Role.ADMIN ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {u.role === Role.ADMIN ? 'Administrador' : 'Asociado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Column */}
            {u.role !== Role.ADMIN && (
              <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
                <button 
                  onClick={() => openUserManagement(u.id, 'MANAGE_LOAN')}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    u.loans.length > 0 
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {u.loans.length > 0 ? (
                    <>
                      <Briefcase size={18} className="mr-2" />
                      Gestionar Préstamo
                    </>
                  ) : (
                    <>
                      <DollarSign size={18} className="mr-2" />
                      Asignar Préstamo
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => openUserManagement(u.id, 'MANAGE_SAVINGS')}
                  className="flex items-center justify-center px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors border border-slate-200"
                >
                  <PiggyBank size={18} className="mr-2" />
                  Gestionar Ahorro
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Stats Footer */}
          {u.role !== Role.ADMIN && (
             <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                 <div className="flex items-center text-sm">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                     <span className="text-slate-500 mr-2">Ahorro:</span>
                     <span className="font-semibold text-slate-700">${u.savings.balance.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center text-sm">
                     <span className={`w-2 h-2 rounded-full mr-2 ${u.loans.length > 0 ? 'bg-orange-500' : 'bg-slate-300'}`}></span>
                     <span className="text-slate-500 mr-2">Deuda:</span>
                     <span className="font-semibold text-slate-700">
                        ${u.loans.reduce((acc, l) => acc + l.remainingAmount, 0).toLocaleString()}
                     </span>
                 </div>
             </div>
          )}
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-4 px-2">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-slate-600">
                Página {currentPage} de {totalPages}
            </span>
            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      )}
    </div>
  );

  /* --------------------------------------------------------------------------------
   * Sub-View: Loan Management
   * -------------------------------------------------------------------------------- */
  const renderLoanManagement = () => {
    if (!selectedUser) return null;
    const activeLoan = selectedUser.loans.find(l => l.status === LoanStatus.ACTIVE);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <button onClick={handleBackToList} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeLoan ? 'Gestionar Préstamo' : 'Asignar Nuevo Préstamo'}
            </h2>
            <p className="text-sm text-slate-500">Usuario: {selectedUser.name}</p>
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

                  <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                     Confirmar Asignación
                  </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* --------------------------------------------------------------------------------
   * Sub-View: Savings Management
   * -------------------------------------------------------------------------------- */
  const renderSavingsManagement = () => {
    if (!selectedUser) return null;
    
    // Calculate Monthly Data for Chart
    const chartData = SavingsService.getMonthlySavingsData(selectedUser.savings.history);
    const editingTransaction = editingSavingsId ? selectedUser.savings.history.find(h => h.id === editingSavingsId) : null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
         <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <button onClick={handleBackToList} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Gestionar Ahorros</h2>
            <p className="text-sm text-slate-500">Usuario: {selectedUser.name}</p>
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
                      <h3 className="text-4xl font-bold text-emerald-900">${selectedUser.savings.balance.toLocaleString()}</h3>
                      <p className="text-emerald-700 text-sm mt-1">
                        +${selectedUser.savings.interestEarned.toLocaleString()} Rendimientos
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

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Last Movements */}
               <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                     <Calendar size={18} className="mr-2 text-slate-400" />
                     Historial Reciente
                  </h4>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl max-h-[300px] overflow-y-auto">
                      {selectedUser.savings.history.length === 0 && (
                          <p className="text-center text-slate-400 text-sm py-4">No hay movimientos registrados</p>
                      )}
                      {selectedUser.savings.history.slice(0, 10).map((h, i) => (
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
                                  {/* Edit Button (only for deposits) */}
                                  {h.type === 'DEPOSIT' && (
                                     <button 
                                       onClick={() => setEditingSavingsId(h.id)}
                                       className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded transition-all text-slate-500"
                                       title="Editar Movimiento"
                                     >
                                         <Edit2 size={14} />
                                     </button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
               </div>
               
               {/* Actions Form */}
               <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 mb-2">
                     {editingSavingsId ? 'Modificar Consignación' : 'Registrar Consignación'}
                  </h4>
                  <div className={`p-6 border rounded-xl shadow-sm transition-colors ${editingSavingsId ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-200'}`}>
                      <form 
                        key={editingSavingsId || 'new'} // Re-mount form when mode changes to reset values properly
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const amount = Number((form.elements.namedItem('amount') as HTMLInputElement).value);
                            const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                            
                            if (amount > 0 && date) {
                                let updatedUser;
                                
                                if (editingSavingsId) {
                                    updatedUser = SavingsService.updateContribution(selectedUser, editingSavingsId, amount, date);
                                    setEditingSavingsId(null); // Exit edit mode
                                } else {
                                    updatedUser = SavingsService.addContribution(selectedUser, amount, date);
                                }

                                // Update Global State
                                const updatedUsers = users.map(u => 
                                    u.id === updatedUser.id ? updatedUser : u
                                );
                                onUpdateUsers(updatedUsers);
                                
                                form.reset();
                            }
                        }}
                        className="space-y-4"
                      >
                          {editingSavingsId && (
                              <div className="bg-orange-100 text-orange-800 p-2 rounded text-xs font-medium mb-2 flex justify-between items-center">
                                  <span>Editando transacción existente</span>
                                  <button type="button" onClick={() => setEditingSavingsId(null)} className="hover:text-orange-950"><X size={14}/></button>
                              </div>
                          )}

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor a Consignar</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input 
                                    name="amount"
                                    type="number" 
                                    required
                                    min="0"
                                    defaultValue={editingTransaction ? editingTransaction.amount : ''}
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                                    placeholder="0"
                                />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha de Registro</label>
                            <input 
                                name="date"
                                type="date" 
                                required
                                defaultValue={editingTransaction ? editingTransaction.date : new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                            />
                          </div>

                          <button 
                            type="submit" 
                            className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 flex justify-center items-center ${
                                editingSavingsId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                              {editingSavingsId ? <Edit2 size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                              {editingSavingsId ? 'Actualizar Ahorro' : 'Registrar Pago'}
                          </button>
                      </form>
                  </div>
               </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                FONDOF
              </span>
              <span className="ml-3 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                PANEL ADMINISTRADOR
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: Users & Details */}
        {activeTab === 'users' && (
           <>
              {!selectedUserId && (
                <>
                  {/* Helper Banner (Only show in list view) */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-8 flex items-start">
                      <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mr-4">
                          <Check size={20} />
                      </div>
                      <div>
                          <h3 className="text-emerald-800 font-bold text-sm">Gestión de Asociados</h3>
                          <p className="text-emerald-700 text-sm mt-1">
                              Seleccione un usuario para asignar créditos o gestionar sus ahorros.
                          </p>
                      </div>
                  </div>

                  {/* Search Bar (Only show in list view) */}
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          activeTab === 'users' ? 'bg-slate-900 text-white shadow-md': 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Users size={16} className="mr-2 inline" />
                        Usuarios
                      </button>
                      <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          activeTab === 'products' ? 'bg-slate-900 text-white shadow-md': 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <ShoppingBag size={16} className="mr-2 inline" />
                        Productos
                      </button>
                    </div>

                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Buscar por nombre o cédula..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    </div>
                  </div>
                </>
              )}

              {/* RENDER CURRENT SUB-VIEW */}
              {viewMode === 'LIST' && renderUserList()}
              {viewMode === 'MANAGE_LOAN' && renderLoanManagement()}
              {viewMode === 'MANAGE_SAVINGS' && renderSavingsManagement()}
           </>
        )}

        {/* VIEW: Products */}
        {activeTab === 'products' && (
           <div>
               <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          activeTab === 'users' ? 'bg-slate-900 text-white shadow-md': 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Users size={16} className="mr-2 inline" />
                        Usuarios
                      </button>
                      <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          activeTab === 'products' ? 'bg-slate-900 text-white shadow-md': 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <ShoppingBag size={16} className="mr-2 inline" />
                        Productos
                      </button>
                    </div>
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                    {editingProduct === product.id ? (
                       <div className="p-4 flex-1 flex flex-col gap-3">
                         {/* Edit Form Content (Same as before) */}
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Editando</span>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Nombre</label>
                            <input 
                                className="w-full text-sm border p-1 rounded" 
                                value={editForm.name || ''} 
                                onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                            />
                        </div>
                         <div>
                            <label className="text-xs text-slate-500">Categoría</label>
                            <input 
                                className="w-full text-sm border p-1 rounded" 
                                value={editForm.category || ''} 
                                onChange={e => setEditForm(prev => ({...prev, category: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Precio</label>
                            <input 
                                type="number"
                                className="w-full text-sm border p-1 rounded" 
                                value={editForm.price || 0} 
                                onChange={e => setEditForm(prev => ({...prev, price: Number(e.target.value)}))}
                            />
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <button 
                                onClick={handleSaveProduct}
                                className="flex-1 bg-emerald-600 text-white rounded p-2 text-sm flex justify-center items-center hover:bg-emerald-700"
                            >
                                <Save size={16} className="mr-1" /> Guardar
                            </button>
                            <button 
                                onClick={handleCancelEdit}
                                className="flex-1 bg-slate-100 text-slate-600 rounded p-2 text-sm flex justify-center items-center hover:bg-slate-200"
                            >
                                <X size={16} className="mr-1" /> Cancelar
                            </button>
                        </div>
                      </div>
                    ) : (
                       <>
                        <div className="h-40 bg-slate-100 relative">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                             <button 
                                onClick={() => handleEditProduct(product)}
                                className="bg-white p-2 rounded-full shadow-md text-slate-600 hover:text-emerald-600 transition-colors"
                             >
                                 <Edit2 size={16} />
                             </button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm capitalize">
                                {product.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800 line-clamp-1" title={product.name}>{product.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1">{product.description}</p>
                          </div>
                          <div className="flex justify-between items-end mt-4">
                            <span className="text-lg font-bold text-emerald-600">${product.price.toLocaleString()}</span>
                            <span className="text-xs text-slate-400">Stock: {product.stock}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
