import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Trading = ({ user, onLogout }) => {
  const [tradeData, setTradeData] = useState({
    symbol: 'EUR/USD',
    type: 'buy',
    amount: '',
    leverage: 1
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setTradeData({
      ...tradeData,
      [e.target.name]: e.target.value
    })
  }

  const executeTrade = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await axios.post('/api/trade', tradeData)
      setMessage(`Trade executed successfully! ID: ${response.data.trade.id}`)
      setTradeData({ ...tradeData, amount: '' })
    } catch (error) {
      setMessage(error.response?.data?.message || 'Trade execution failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">GlobalTrade360 - Trading</div>
        <div className="navbar-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/trading" className="nav-link">Trading</Link>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="trading-panel">
          <div className="trading-chart">
            <h3>Live Chart - {tradeData.symbol}</h3>
            <div style={{ 
              height: '400px', 
              background: '#f8f9fa', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              borderRadius: '10px',
              border: '2px dashed #ddd'
            }}>
              <p>Live Trading Chart Would Appear Here</p>
            </div>
          </div>

          <div className="trade-form">
            <h3>Execute Trade</h3>
            <form onSubmit={executeTrade}>
              <div>
                <label>Symbol</label>
                <select name="symbol" value={tradeData.symbol} onChange={handleChange}>
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="BTC/USD">BTC/USD</option>
                  <option value="ETH/USD">ETH/USD</option>
                </select>
              </div>

              <div>
                <label>Type</label>
                <select name="type" value={tradeData.type} onChange={handleChange}>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label>Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  value={tradeData.amount}
                  onChange={handleChange}
                  required
                  placeholder="Enter amount"
                  min="1"
                />
              </div>

              <div>
                <label>Leverage</label>
                <select name="leverage" value={tradeData.leverage} onChange={handleChange}>
                  <option value="1">1x</option>
                  <option value="5">5x</option>
                  <option value="10">10x</option>
                  <option value="20">20x</option>
                </select>
              </div>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Executing...' : 'Execute Trade'}
              </button>
            </form>

            <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
              <h4>Account Summary</h4>
              <p><strong>Balance:</strong> ${user?.balance?.toFixed(2)}</p>
              <p><strong>Available:</strong> ${user?.balance?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trading