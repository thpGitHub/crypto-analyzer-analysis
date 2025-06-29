require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const cryptoRoutes = require('./routes/crypto.routes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/crypto_db';

// Connexion MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3005'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Routes
app.use('/api/crypto', cryptoRoutes);

app.listen(PORT, () => {
  logger.info(`Crypto Analyzer Service running on port ${PORT}`);
}); 