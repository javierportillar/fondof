import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';
import { 
  Wallet, 
  LayoutDashboard, 
  PiggyBank, 
  ShoppingBasket, 
  Bot, 
  LogOut, 
  Menu, 
  X,
  ClipboardList
} from 'lucide-react';

interface UserLayoutProps {
  user: UserProfile;
  onLogout: () => void;
}

export default function UserLayout({ user, onLogout }: UserLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => {
      const isActive = location.pathname === path;
      return (
        <Link
          to={path}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          <Icon size={20} />
          <span className="font-medium">{label}</span>
        </Link>
      );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Wallet className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fondo Fortuna</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem path="/dashboard" icon={LayoutDashboard} label="Resumen General" />
          <NavItem path="/loans" icon={Wallet} label="Mis Préstamos" />
          <NavItem path="/savings" icon={PiggyBank} label="Ahorro Programado" />
          <NavItem path="/orders" icon={ClipboardList} label="Mis Pedidos" />
          <NavItem path="/store" icon={ShoppingBasket} label="Tienda Fondo Fortuna" />
          <div className="pt-4 border-t border-slate-100 mt-4">
            <NavItem path="/advisor" icon={Bot} label="Asesor IA" />
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate w-24">{user.name}</p>
                <p className="text-xs text-slate-500">Socio #{user.id}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Wallet className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold text-slate-800">Fondo Fortuna</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-30 pt-16 px-4 md:hidden flex flex-col space-y-2">
          <NavItem path="/dashboard" icon={LayoutDashboard} label="Resumen General" />
          <NavItem path="/loans" icon={Wallet} label="Mis Préstamos" />
          <NavItem path="/savings" icon={PiggyBank} label="Ahorro Programado" />
          <NavItem path="/orders" icon={ClipboardList} label="Mis Pedidos" />
          <NavItem path="/store" icon={ShoppingBasket} label="Tienda Fondo Fortuna" />
          <NavItem path="/advisor" icon={Bot} label="Asesor IA" />
          <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-auto border-t border-red-100"
          >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-full pt-16 md:pt-0 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
