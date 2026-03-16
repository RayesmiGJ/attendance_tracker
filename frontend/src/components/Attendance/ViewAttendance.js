import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function ViewAttendance({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from_date: '', to_date: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (filterParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filterParams).toString();
      const url = params ? `/attendance/view/?${params}` : '/attendance/view/';
      const response = await api.get(url);
      setRecords(response.data.records);
    } catch (error) {
      console.error('Failed to fetch records', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchRecords(filters);
  };

  const handleClearFilters = () => {
    setFilters({ from_date: '', to_date: '' });
    fetchRecords();
  };

  const handleBack = () => {
    if (user.is_admin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Present': return styles.present;
      case 'Leave': return styles.leave;
      case 'WFH': return styles.wfh;
      default: return {};
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Attendance Records</h2>
        
        <div style={styles.filterSection}>
          <form onSubmit={handleFilterSubmit} style={styles.filterForm}>
            <div style={styles.filterRow}>
              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>From Date</label>
                <input
                  type="date"
                  name="from_date"
                  value={filters.from_date}
                  onChange={handleFilterChange}
                  style={styles.filterInput}
                />
              </div>
              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>To Date</label>
                <input
                  type="date"
                  name="to_date"
                  value={filters.to_date}
                  onChange={handleFilterChange}
                  style={styles.filterInput}
                />
              </div>
              <div style={styles.filterActions}>
                <button type="submit" style={styles.filterButton}>Filter</button>
                <button type="button" onClick={handleClearFilters} style={styles.clearButton}>Clear</button>
              </div>
            </div>
          </form>
        </div>
        
        {loading ? (
          <div style={styles.loading}>Loading records...</div>
        ) : (
          <>
            {records.length === 0 ? (
              <div style={styles.noRecords}>No records found</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Details</th>
                      <th style={styles.th}>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={index} style={styles.tr}>
                        <td style={styles.td}>{formatDate(record.date)}</td>
                        <td style={{...styles.td, ...getStatusClass(record.status)}}>
                          {record.status === 'Present' && '✓ '}
                          {record.status === 'Leave' && '✗ '}
                          {record.status}
                        </td>
                        <td style={styles.td}>{record.details}</td>
                        <td style={styles.td}>{formatDateTime(record.applied_on)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        
        <button onClick={handleBack} style={styles.backButton}>Back to Dashboard</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    minHeight: '100vh',
  },
  content: {
    maxWidth: '1100px', 
    margin: '0 auto',
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    border: '2px solid var(--moss-green)',
  },
  title: {
    color: 'var(--moss-dark)',
    fontSize: '28px',
    marginTop: 0,
    marginBottom: '25px',
    fontWeight: 500,
    textAlign: 'center',
    borderBottom: '2px solid var(--moss-light)',
    paddingBottom: '15px',
  },
  filterSection: {
    backgroundColor: 'var(--moss-pale)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px',
    border: '1px solid var(--moss-green)',
  },
  filterForm: {
    width: '100%',
  },
  filterRow: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  filterItem: {
    flex: 1,
    minWidth: '200px',
  },
  filterLabel: {
    display: 'block',
    color: 'var(--moss-dark)',
    fontWeight: 500,
    marginBottom: '5px',
    fontSize: '15px',
  },
  filterInput: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid var(--moss-green)',
    borderRadius: '8px',
    fontFamily: 'Times New Roman, Times, serif',
    fontSize: '15px',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  filterActions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '2px',
  },
  filterButton: {
    padding: '10px 25px',
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    border: '1px solid var(--moss-dark)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
  },
  clearButton: {
    padding: '10px 25px',
    backgroundColor: 'white',
    color: 'var(--moss-dark)',
    border: '1px solid var(--moss-green)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '25px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '10px',
    overflow: 'hidden',
    minWidth: '800px', 
  },
  th: {
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    padding: '15px 12px',
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid var(--moss-light)',
  },
  td: {
    padding: '12px 12px',
    fontSize: '16px',
    backgroundColor: 'white',
  },
  present: {
    color: '#2d6a4f',
    fontWeight: 500,
  },
  leave: {
    color: '#b02a37',
    fontWeight: 500,
  },
  wfh: {
    color: '#7b4f2d',
    fontWeight: 500,
  },
  noRecords: {
    textAlign: 'center',
    color: 'var(--moss-dark)',
    padding: '30px',
    backgroundColor: 'var(--moss-pale)',
    borderRadius: '8px',
    fontSize: '16px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--moss-dark)',
  },
  backButton: {
    display: 'inline-block',
    backgroundColor: 'var(--moss-pale)',
    color: 'var(--moss-dark)',
    padding: '12px 25px',
    border: '2px solid var(--moss-green)',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: 'Times New Roman, Times, serif',
  },
};

export default ViewAttendance;