import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function UserDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout/');
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>User Dashboard - {user?.username}</h2>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>
      
      <div style={styles.menu}>
        <Link to="/attendance/mark" style={styles.menuItem}>Mark Attendance</Link>
        <Link to="/attendance/view" style={styles.menuItem}>View Attendance</Link>
        <Link to="/wfh/apply" style={styles.menuItem}>Apply Work From Home</Link>
        <Link to="/leave/apply" style={styles.menuItem}>Apply Leave</Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    backgroundColor: 'var(--moss-dark)',
    color: 'white',
    padding: '20px 30px',
    borderRadius: '12px',
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
  },
  headerTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 500,
  },
  logoutButton: {
    backgroundColor: 'var(--moss-pale)',
    color: 'var(--moss-dark)',
    border: 'none',
    padding: '8px 25px',
    borderRadius: '25px',
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: 'Times New Roman, Times, serif',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid var(--moss-green)',
    textAlign: 'center',
  },
  menu: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '25px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  menuItem: {
    backgroundColor: 'white',
    color: 'var(--moss-dark)',
    textDecoration: 'none',
    padding: '30px 20px',
    borderRadius: '12px',
    fontSize: '20px',
    border: '2px solid var(--moss-green)',
    textAlign: 'center',
    transition: '0.2s',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
};

export default UserDashboard;