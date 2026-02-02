import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Role } from './types';

// Auth
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import SavingsSection from './components/SavingsSection';
import LoanSection from './components/LoanSection';
import StoreSection from './components/StoreSection';
import Advisor from './components/Advisor';

// Layouts
import AdminLayout from './components/admin/AdminLayout';
import UserLayout from './components/UserLayout';

// Admin Components
import UserList from './components/admin/UserList';
import ProductList from './components/admin/ProductList';
import LoanManager from './components/admin/LoanManager';
import SavingsManager from './components/admin/SavingsManager';
import SavingsForm from './components/admin/SavingsForm';
import UserForm from './components/admin/UserForm';
import ProductForm from './components/admin/ProductForm';

function AppRoutes() {
  const { profile, loading, login, logout } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!profile) {
    return <LoginScreen onLogin={login} users={[]} />;
  }

  return (
    <Routes>
      {/* Redirect Root */}
      <Route path="/" element={<Navigate to={profile.role === Role.ADMIN ? '/admin' : '/dashboard'} replace />} />
      
      {/* Admin Routes */}
      {profile.role === Role.ADMIN && (
        <Route path="/admin" element={<AdminLayout user={profile} onLogout={logout} />}>
          <Route index element={<UserList />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="users/:userId/loans" element={<LoanManager />} />
          <Route path="users/:userId/savings" element={<SavingsManager />} />
          <Route path="users/:userId/savings/new" element={<SavingsForm />} />
          <Route path="users/:userId/savings/edit/:txnId" element={<SavingsForm />} />
        </Route>
      )}

      {/* User Routes */}
      {profile.role === Role.USER && (
        <Route element={<UserLayout user={profile} onLogout={logout} />}>
          <Route path="/dashboard" element={<Dashboard user={profile} />} />
          <Route path="/loans" element={<LoanSection user={profile} />} />
          <Route path="/savings" element={<SavingsSection user={profile} />} />
          <Route path="/store" element={<StoreSection />} />
          <Route path="/advisor" element={<Advisor user={profile} />} />
        </Route>
      )}

      {/* Catch All / Fallback */}
      <Route path="*" element={<Navigate to={profile.role === Role.ADMIN ? '/admin' : '/dashboard'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}