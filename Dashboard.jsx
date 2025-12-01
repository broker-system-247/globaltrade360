import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Dashboard = ({ user, onLogout }) => {
  const [userData, setUserData] = useState(user)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/user/profile')
      setUserData(response.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">GlobalTrade360</div>
        <div className="navbar-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/trading" className="nav-link">Trading</Link>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {message && <div className="alert alert-info">{message}</div>}
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Account Balance</h3>
            <div className="value">${userData?.balance?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="stat-card">
            <h3>Account Status</h3>
            <div className="value" style={{ color: userData?.isActive ? '#28a745' : '#dc3545' }}>
              {userData?.isActive ? 'Active' : 'Disabled'}
            </div>
          </div>
          <div className="stat-card">
            <h3>Member Since</h3>
            <div className="value">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="actions-grid">
          <div className="action-card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/trading" className="btn">Start Trading</Link>
              <button className="btn btn-secondary">Deposit Funds</button>
              <button className="btn btn-secondary">Withdraw Funds</button>
            </div>
          </div>

          <div className="action-card">
            <h3>Account Information</h3>
            <div style={{ lineHeight: '2' }}>
              <div><strong>Name:</strong> {userData?.firstName} {userData?.lastName}</div>
              <div><strong>Email:</strong> {userData?.email}</div>
              <div><strong>Phone:</strong> {userData?.phone}</div>
              <div><strong>Account Type:</strong> {userData?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard