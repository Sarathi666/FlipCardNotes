const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Basic middleware
app.use(cors());

// Configure body parser with increased limits
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Routes
app.use('/api/workspaces', require('./routes/workspaces'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/auth', require('./routes/auth'));

// Error handling middleware - should be after routes
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle specific errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      message: 'Invalid JSON payload',
      error: err.message 
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      message: 'Request entity too large',
      error: err.message 
    });
  }

  // Handle mongoose errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      message: 'Database error',
      error: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
