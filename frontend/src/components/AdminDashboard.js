import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AddUserModal from './Admin/AddUserModal';

function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const itemsPerPage = 2;

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/all-users-with-activity/');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const handleUserAdded = () => {
    fetchUsers();
  };

  // Sort users alphabetically by username
  const sortedUsers = [...users].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.username.localeCompare(b.username);
    } else {
      return b.username.localeCompare(a.username);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const formatLastLogin = (userData) => {
    return userData.last_login || 'N/A';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Admin Dashboard - {user?.username}</h2>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>

      {/* Navigation Links */}
      <div style={styles.navLinks}>
        <button onClick={() => setShowAddUserModal(true)} style={styles.addUserButton}>
          + Add New User
        </button>
        <Link to="/admin/leave-requests" style={styles.leaveRequestsLink}>
          View Leave Requests
        </Link>
      </div>

      {/* Users Table with Pagination */}
      <div style={styles.usersSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>All Users</h3>
          <button onClick={toggleSortOrder} style={styles.sortButton}>
            Sort {sortOrder === 'asc' ? '↓ A-Z' : '↑ Z-A'}
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading users...</div>
        ) : (
          <><div style={styles.tableWrapper}>

  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>S.No</th>
        <th style={styles.th}>Name</th>
        <th style={styles.th}>Email</th>
        <th style={styles.th}>Username</th>
        <th style={styles.th}>Last Login</th>
      </tr>
    </thead>
    <tbody>
      {paginatedUsers.map((userData, index) => (
        <tr key={userData.id} style={styles.tr}>
          <td style={styles.td}>{startIndex + index + 1}</td>
          <td style={styles.td}>
            {userData.first_name || userData.username} {userData.last_name}
            {userData.is_staff && <span style={styles.adminBadgeInline}>Admin</span>}
          </td>
          <td style={styles.td}>{userData.email || 'No email'}</td>
          <td style={styles.td}>{userData.username}</td>
          <td style={styles.td}>{formatLastLogin(userData)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={styles.pageButton}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => goToPage(index + 1)}
                    style={{
                      ...styles.pageNumber,
                      ...(currentPage === index + 1 ? styles.activePage : {})
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={styles.pageButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
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
    marginBottom: '30px',
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
  navLinks: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
  },
  addUserButton: {
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: 'Times New Roman, Times, serif',
  },
  leaveRequestsLink: {
    backgroundColor: 'var(--moss-pale)',
    color: 'var(--moss-dark)',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 500,
    border: '1px solid var(--moss-green)',
  },
  usersSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    border: '2px solid var(--moss-green)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid var(--moss-light)',
    paddingBottom: '10px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    color: 'var(--moss-dark)',
  },
  sortButton: {
    backgroundColor: 'var(--moss-pale)',
    border: '1px solid var(--moss-green)',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '16px',
    fontWeight: 500,
  },
  tr: {
    borderBottom: '1px solid var(--moss-light)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '12px 15px',
    fontSize: '14px',
    color: '#333',
  },
  adminBadgeInline: {
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    marginLeft: '8px',
    display: 'inline-block',
  },
  loading: {
    textAlign: 'center',
    padding: '30px',
    color: 'var(--moss-dark)',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '25px',
    paddingTop: '15px',
    borderTop: '1px solid var(--moss-light)',
  },
  pageButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--moss-pale)',
    border: '1px solid var(--moss-green)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'Times New Roman, Times, serif',
  },
  pageNumber: {
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '1px solid var(--moss-green)',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  activePage: {
    backgroundColor: 'var(--moss-green)',
    color: 'white',
  },
};

export default AdminDashboard;