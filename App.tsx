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
import UserOrders from './components/UserOrders';

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
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Orders from './components/admin/Orders';

function AppRoutes() {
  const { profile, loading, login, logout } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public store as home */}
      <Route path="/" element={<StoreSection userId={profile?.id} profile={profile || undefined} onLogout={logout} />} />
      <Route path="/store" element={<StoreSection userId={profile?.id} profile={profile || undefined} onLogout={logout} />} />

      {/* Auth */}
      <Route path="/login" element={profile ? <Navigate to={profile.role === Role.ADMIN ? '/admin' : '/dashboard'} replace /> : <LoginScreen onLogin={login} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Redirect Root */}
      {/* Admin Routes */}
      <Route path="/admin" element={profile && profile.role === Role.ADMIN ? <AdminLayout user={profile} onLogout={logout} /> : <Navigate to="/" replace />}>
        <Route index element={<UserList />} />
        <Route path="users/new" element={<UserForm />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users/:userId/loans" element={<LoanManager />} />
        <Route path="users/:userId/savings" element={<SavingsManager />} />
        <Route path="users/:userId/savings/new" element={<SavingsForm />} />
        <Route path="users/:userId/savings/edit/:txnId" element={<SavingsForm />} />
      </Route>

      {/* Admin Routes */}
      {/* User Routes */}
      <Route element={profile && profile.role === Role.USER ? <UserLayout user={profile} onLogout={logout} /> : <Navigate to="/" replace />}>
        <Route path="/dashboard" element={<Dashboard user={profile || undefined as any} />} />
        <Route path="/loans" element={<LoanSection user={profile || undefined as any} />} />
        <Route path="/savings" element={<SavingsSection user={profile || undefined as any} />} />
        <Route path="/orders" element={<UserOrders userId={profile?.id || ''} />} />
        <Route path="/advisor" element={<Advisor user={profile || undefined as any} />} />
      </Route>

      {/* Catch All / Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
