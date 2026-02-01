import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserProfile, Role } from './types';
import { MOCK_USERS } from './constants';

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

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('fondof_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('fondof_current_user');
  });
  const navigate = useNavigate();
  
  // 3. User Data Persistence Effect
  useEffect(() => {
    localStorage.setItem('fondof_users', JSON.stringify(users));
  }, [users]);

  // 3b. Session Persistence Effect
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('fondof_current_user', currentUserId);
    } else {
      localStorage.removeItem('fondof_current_user');
    }
  }, [currentUserId]);

  // 4. Auto-Logout Effect
  useEffect(() => {
    // 30 minutes in milliseconds
    const INACTIVITY_LIMIT = 30 * 60 * 1000; 
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentUserId) {
        timeoutId = setTimeout(() => {
           alert("Sesión cerrada por inactividad.");
           handleLogout();
        }, INACTIVITY_LIMIT);
      }
    };

    // Listeners for activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    // Initial start
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [currentUserId]); // Re-run when user logs in/out

  // Derived Active User
  const activeUser = currentUserId ? users.find(u => u.id === currentUserId) || null : null;

  const handleLogin = (user: UserProfile) => {
    setCurrentUserId(user.id);
    // Redirect based on role
    if (user.role === Role.ADMIN) {
        navigate('/admin');
    } else {
        navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null); // This triggers the effect to remove from localStorage
    navigate('/login');
  };

  const handleUpdateUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
  };

  return (
    <Routes>
        {/* Public Route */}
        <Route path="/login" element={
            !activeUser ? <LoginScreen onLogin={handleLogin} /> : <Navigate to={activeUser.role === Role.ADMIN ? '/admin' : '/dashboard'} replace />
        } />

        {/* Redirect Root */}
        <Route path="/" element={<Navigate to={activeUser ? (activeUser.role === Role.ADMIN ? '/admin' : '/dashboard') : '/login'} replace />} />

        {/* Admin Routes */}
        {activeUser?.role === Role.ADMIN && (
            <Route path="/admin" element={<AdminLayout user={activeUser} onLogout={handleLogout} />}>
                <Route index element={<UserList users={users} />} />
                <Route path="products" element={<ProductList />} />
                <Route path="users/:userId/loans" element={<LoanManager users={users} onUpdateUsers={handleUpdateUsers} />} />
                <Route path="users/:userId/savings" element={<SavingsManager users={users} />} />
                <Route path="users/:userId/savings/new" element={<SavingsForm users={users} onUpdateUsers={handleUpdateUsers} />} />
                <Route path="users/:userId/savings/edit/:txnId" element={<SavingsForm users={users} onUpdateUsers={handleUpdateUsers} />} />
            </Route>
        )}

        {/* User Routes */}
        {activeUser?.role === Role.USER && (
            <Route element={<UserLayout user={activeUser} onLogout={handleLogout} />}>
                <Route path="/dashboard" element={<Dashboard user={activeUser} />} />
                <Route path="/loans" element={<LoanSection user={activeUser} />} />
                <Route path="/savings" element={<SavingsSection user={activeUser} />} />
                <Route path="/store" element={<StoreSection />} />
                <Route path="/advisor" element={<Advisor user={activeUser} />} />
            </Route>
        )}

        {/* Catch All / Fallback */}
        <Route path="*" element={<Navigate to={activeUser ? (activeUser.role === Role.ADMIN ? '/admin' : '/dashboard') : '/login'} replace />} />
    </Routes>
  );
}