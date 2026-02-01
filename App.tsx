import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserProfile, Role, Product } from './types';
import { USERS_DATA } from './data/users';
import { PRODUCTS_DATA } from './data/products';

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

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('fondof_users');
    return saved ? JSON.parse(saved) : USERS_DATA;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('fondof_products');
    return saved ? JSON.parse(saved) : PRODUCTS_DATA;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('fondof_current_user');
  });
  const navigate = useNavigate();
  
  // 3. User & Product Data Persistence Effect
  useEffect(() => {
    localStorage.setItem('fondof_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fondof_products', JSON.stringify(products));
  }, [products]);

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

  const handleAddUser = (newUser: UserProfile) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };
  
  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // Also update current session user if it matches to keep UI in sync immediately?
    // Actually `activeUser` is derived from `users` + `currentUserId`, so it will update automatically.
  };

  return (
    <Routes>
        {/* Public Route */}
        <Route path="/login" element={
            !activeUser ? <LoginScreen onLogin={handleLogin} users={users} /> : <Navigate to={activeUser.role === Role.ADMIN ? '/admin' : '/dashboard'} replace />
        } />

        {/* Redirect Root */}
        <Route path="/" element={<Navigate to={activeUser ? (activeUser.role === Role.ADMIN ? '/admin' : '/dashboard') : '/login'} replace />} />

        {/* Admin Routes */}
        {activeUser?.role === Role.ADMIN && (
            <Route path="/admin" element={<AdminLayout user={activeUser} onLogout={handleLogout} />}>
                <Route index element={<UserList users={users} />} />
                <Route path="users/new" element={<UserForm users={users} onAddUser={handleAddUser} />} />
                <Route path="products" element={<ProductList products={products} onUpdateProducts={handleUpdateProducts} />} />
                <Route path="products/new" element={<ProductForm onAddProduct={handleAddProduct} />} />
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
                <Route path="/savings" element={<SavingsSection user={activeUser} onUpdateUser={handleUpdateUser} />} />
                <Route path="/store" element={<StoreSection products={products} />} />
                <Route path="/advisor" element={<Advisor user={activeUser} />} />
            </Route>
        )}

        {/* Catch All / Fallback */}
        <Route path="*" element={<Navigate to={activeUser ? (activeUser.role === Role.ADMIN ? '/admin' : '/dashboard') : '/login'} replace />} />
    </Routes>
  );
}