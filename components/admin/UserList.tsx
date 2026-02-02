import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile, Role } from '../../types';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  DollarSign, 
  Briefcase, 
  PiggyBank, 
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

export default function UserList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[UserList] Fetching users from Supabase');

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[UserList] Supabase error', error);
          throw error;
        }

        const mapped = (data || []).map((u) => ({
          id: u.id,
          name: u.name,
          cedula: u.cedula,
          email: u.email,
          phoneNumber: u.phone_number,
          createdAt: u.created_at,
          role: u.role === 'ADMIN' ? Role.ADMIN : Role.USER,
          creditLimit: u.credit_limit ?? 0,
          savings: {
            balance: 0,
            monthlyContribution: 0,
            lastContributionDate: '',
            interestEarned: 0,
            history: []
          },
          loans: []
        })) as UserProfile[];

        console.log('[UserList] Users received:', mapped.length);
        setUsers(mapped);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar la lista de usuarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  return (
    <div className="space-y-6">
      {loading && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
          Cargando usuarios...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
      <>
      {/* Helper Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start">
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

      {/* Search Bar & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
        <Link 
            to="/admin/users/new"
            className="w-full md:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center"
        >
            <span className="mr-2 text-xl">+</span> Crear Nuevo Usuario
        </Link>
      </div>

      {/* User List */}
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
                  <Link 
                    to={`/admin/users/${u.id}/loans`}
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
                  </Link>
                  
                  <Link 
                    to={`/admin/users/${u.id}/savings`}
                    className="flex items-center justify-center px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors border border-slate-200"
                  >
                    <PiggyBank size={18} className="mr-2" />
                    Gestionar Ahorro
                  </Link>
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
      </>
      )}
    </div>
  );
}
