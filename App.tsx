import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  PiggyBank, 
  ShoppingBasket, 
  Bot, 
  Menu, 
  X 
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import LoanSection from './components/LoanSection';
import SavingsSection from './components/SavingsSection';
import StoreSection from './components/StoreSection';
import Advisor from './components/Advisor';
import { UserProfile } from './types';
import { MOCK_USER } from './constants';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'loans' | 'savings' | 'store' | 'advisor'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Shared state for the demo
  const [user, setUser] = useState<UserProfile>(MOCK_USER);

  const NavItem = ({ view, icon: Icon, label }: { view: typeof currentView, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentView === view 
          ? 'bg-emerald-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

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
          <NavItem view="dashboard" icon={LayoutDashboard} label="Resumen General" />
          <NavItem view="loans" icon={Wallet} label="Mis Préstamos" />
          <NavItem view="savings" icon={PiggyBank} label="Ahorro Programado" />
          <NavItem view="store" icon={ShoppingBasket} label="Tienda Solidaria" />
          <div className="pt-4 border-t border-slate-100 mt-4">
            <NavItem view="advisor" icon={Bot} label="Asesor IA" />
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <img src="https://picsum.photos/40/40" alt="User" className="w-10 h-10 rounded-full border-2 border-emerald-100" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">Socio #{user.id}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white border-b border-slate-200 z-20 px-4 py-3 flex items-center justify-between">
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
        <div className="fixed inset-0 bg-white z-10 pt-16 px-4 md:hidden flex flex-col space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Resumen General" />
          <NavItem view="loans" icon={Wallet} label="Mis Préstamos" />
          <NavItem view="savings" icon={PiggyBank} label="Ahorro Programado" />
          <NavItem view="store" icon={ShoppingBasket} label="Tienda Solidaria" />
          <NavItem view="advisor" icon={Bot} label="Asesor IA" />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-full pt-16 md:pt-0 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {currentView === 'dashboard' && <Dashboard user={user} />}
          {currentView === 'loans' && <LoanSection user={user} />}
          {currentView === 'savings' && <SavingsSection user={user} />}
          {currentView === 'store' && <StoreSection />}
          {currentView === 'advisor' && <Advisor user={user} />}
        </div>
      </main>
    </div>
  );
}