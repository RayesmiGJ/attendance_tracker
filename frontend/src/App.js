import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import MarkAttendance from './components/Attendance/MarkAttendance';
import ViewAttendance from './components/Attendance/ViewAttendance';
import ApplyLeave from './components/Leave/ApplyLeave';
import ApplyWFH from './components/WFH/ApplyWFH';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/check-auth/');
        if (response.data.authenticated) {
          setUser(response.data.user);
          setIsAdmin(response.data.user.is_admin);
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.user);
    setIsAdmin(userData.user.is_admin);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <Login onLogin={handleLogin} />
        } />
        
        <Route path="/admin" element={
          user && isAdmin ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        
        <Route path="/dashboard" element={
          user && !isAdmin ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        
        <Route path="/attendance/mark" element={
          user ? <MarkAttendance user={user} /> : <Navigate to="/login" />
        } />
        
        <Route path="/attendance/view" element={
          user ? <ViewAttendance user={user} /> : <Navigate to="/login" />
        } />
        
        <Route path="/leave/apply" element={
          user ? <ApplyLeave user={user} /> : <Navigate to="/login" />
        } />
        
        <Route path="/wfh/apply" element={
          user ? <ApplyWFH user={user} /> : <Navigate to="/login" />
        } />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '20px',
    color: 'var(--moss-dark)'
  }
};

export default App;