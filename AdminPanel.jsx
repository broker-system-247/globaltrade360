import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const AdminPanel = ({ user, onLogout }) => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage('Error fetching users')
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, {
        isActive: !currentStatus
      })
      setMessage(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`)
      fetchUsers()
    } catch (error) {
      setMessage('Error updating user status')
    }
  }

  const updateBalance = async (type) => {
    if (!selectedUser || !balanceAmount) {
      setMessage('Please select a user and enter amount')
      return
    }

    try {
      await axios.post(`/api/admin/users/${selectedUser}/balance`, {
        amount: balanceAmount,
        type: type
      })
      setMessage(`Balance ${type}ed successfully`)
      setBalanceAmount('')
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      setMessage('Error updating balance')
    }
  }

  return (
    <div className="admin-panel">
      <nav className="navbar">
        <div className="navbar-brand">GlobalTrade360 - Admin Panel</div>
        <div className="navbar-nav">
          <Link to="/admin" className="nav-link">Users</Link>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="action-card" style={{ marginBottom: '20px' }}>
          <h3>Balance Management</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              value={selectedUser || ''} 
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px' }}
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.email} (${user.balance})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: '2px solid #ddd' }}
            />
            <button 
              onClick={() => updateBalance('add')} 
              className="btn btn-success"
              disabled={!selectedUser || !balanceAmount}
            >
              Add Funds
            </button>
            <button 
              onClick={() => updateBalance('subtract')} 
              className="btn btn-danger"
              disabled={!selectedUser || !balanceAmount}
            >
              Subtract Funds
            </button>
          </div>
        </div>

        <div className="users-table">
          <h3>Registered Users</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>${user.balance?.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{user.role}</td>
                  <td>
                    <button 
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`btn ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel