import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { UserProfile, Role } from '../../types';
import { Users, ShoppingBag, LogOut, Wallet } from 'lucide-react';

interface AdminLayoutProps {
  user: UserProfile;
  onLogout: () => void;
}

export default function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/admin" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                    FONDOF
                </span>
                <span className="ml-3 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                    PANEL ADMINISTRADOR
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Sub-header) */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex space-x-6">
                 <Link 
                    to="/admin" 
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center transition-colors ${
                        location.pathname === '/admin' || location.pathname.includes('/users') 
                        ? 'border-emerald-500 text-emerald-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                 >
                     <Users size={18} className="mr-2" />
                     Gestión de Usuarios
                 </Link>
                 <Link 
                    to="/admin/products" 
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center transition-colors ${
                        location.pathname.includes('/products')
                        ? 'border-emerald-500 text-emerald-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                 >
                     <ShoppingBag size={18} className="mr-2" />
                     Gestión de Productos
                 </Link>
             </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}
