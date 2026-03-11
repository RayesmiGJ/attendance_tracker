import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({...credentials,[e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/login/', credentials);
      if (response.data.success) {
        onLogin(response.data);
        if (response.data.user.is_admin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Attendance Tracker</h2>
        <form onSubmit={handleSubmit} style={styles.form}>

          <input type="text" name="username" placeholder="Username" value={credentials.username} onChange={handleChange} required style={styles.input} />
          <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required style={styles.input} />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--moss-light)',
  },
  loginBox: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    width: '350px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    border: '2px solid var(--moss-green)',
  },
  title: {
    color: 'var(--moss-dark)',
    fontSize: '28px',
    marginTop: 0,
    marginBottom: '30px',
    textAlign: 'center',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    border: '2px solid var(--moss-pale)',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
    boxSizing: 'border-box',
  },
  button: {
    width: '50%',
    margin: '20px auto 0',
    padding: '12px',
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    border: '1px solid var(--moss-dark)',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
    cursor: 'pointer',
    transition: '0.2s',
  },
  error: {
    color: '#a94442',
    backgroundColor: '#f2dede',
    padding: '10px',
    borderRadius: '8px',
    margin: '10px 0',
    textAlign: 'center',
    border: '1px solid #ebccd1',
  },
};

export default Login;