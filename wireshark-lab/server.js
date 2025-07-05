const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Replace this with your actual MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mytaxi?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Atlas Connected'))
.catch(err => console.error('❌ Connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Dummy user for login example
const dummyUser = {
  email: 'test@example.com',
  password: '123456',
  role: 'driver'
};

const SECRET_KEY = 'secret123';

// Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === dummyUser.email && password === dummyUser.password) {
    const token = jwt.sign({ email, role: dummyUser.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Protected Route Example
app.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: 'Profile data accessed', user: decoded });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});