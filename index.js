const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in production, use MongoDB Atlas)
let users = [
  {
    id: 1,
    email: 'admin@globalinvestment360',
    password: '$2a$10$8K1p/a0dRTlR0eM8J5R5Ee5bW5c5Q5a5Z5e5bW5c5Q5a5Z5e5bW5c', // myhandwork
    role: 'admin',
    balance: 0,
    isActive: true,
    createdAt: new Date()
  }
];

let trades = [];
let transactions = [];

// Connect to MongoDB (for production)
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/globaltrade360');

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Routes

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      role: 'user',
      firstName,
      lastName,
      phone,
      balance: 0,
      isActive: true,
      createdAt: new Date()
    };

    users.push(newUser);

    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        balance: newUser.balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is disabled' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/users', authenticate, isAdmin, (req, res) => {
  const userList = users.map(user => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    balance: user.balance,
    isActive: user.isActive,
    createdAt: user.createdAt,
    role: user.role
  }));
  res.json(userList);
});

app.put('/api/admin/users/:userId/status', authenticate, isAdmin, (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.isActive = isActive;
  res.json({ message: `User account ${isActive ? 'enabled' : 'disabled'}` });
});

app.post('/api/admin/users/:userId/balance', authenticate, isAdmin, (req, res) => {
  const { userId } = req.params;
  const { amount, type } = req.body;

  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (type === 'add') {
    user.balance += parseFloat(amount);
  } else if (type === 'subtract') {
    user.balance -= parseFloat(amount);
  }

  // Record transaction
  transactions.push({
    id: transactions.length + 1,
    userId: user.id,
    type: 'admin_adjustment',
    amount: parseFloat(amount),
    description: `Admin ${type} balance`,
    createdAt: new Date()
  });

  res.json({ 
    message: `Balance ${type}ed successfully`, 
    newBalance: user.balance 
  });
});

// User routes
app.get('/api/user/profile', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    balance: user.balance,
    isActive: user.isActive
  });
});

app.post('/api/trade', authenticate, (req, res) => {
  const { symbol, type, amount, leverage } = req.body;
  const user = users.find(u => u.id === req.user.id);

  if (!user.isActive) {
    return res.status(400).json({ message: 'Account is disabled' });
  }

  if (user.balance < amount) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  // Simulate trade execution
  const trade = {
    id: trades.length + 1,
    userId: user.id,
    symbol,
    type,
    amount: parseFloat(amount),
    leverage: leverage || 1,
    status: 'open',
    openPrice: Math.random() * 100 + 100, // Mock price
    createdAt: new Date()
  };

  trades.push(trade);
  user.balance -= parseFloat(amount);

  res.json({ message: 'Trade executed successfully', trade });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Admin credentials:');
  console.log('Email: admin@globalinvestment360');
  console.log('Password: myhandwork');
});