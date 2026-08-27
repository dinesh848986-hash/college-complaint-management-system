const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const { seedDemoData } = require('./config/seed');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error(
      '[Configuration Error] FATAL: JWT_SECRET environment variable is required in production mode.'
    );
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error(
      '[Configuration Error] FATAL: MONGODB_URI environment variable is required in production mode.'
    );
    process.exit(1);
  }
}

const app = express();

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
];

if (process.env.CLIENT_URL) {
  const configuredOrigins = process.env.CLIENT_URL.split(',').map((url) => url.trim());
  allowedOrigins.push(...configuredOrigins);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, curl, server-to-server)
    if (!origin) return callback(null, true);

    // In development, allow localhost and tunnel origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked request from unauthorized origin: ${origin}`)
    );
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'College Complaint Management System API',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Combined Frontend & Backend: Serve built React frontend from client/dist
const clientDistPath = path.join(__dirname, '../../client/dist');
console.log('[Static Files] clientDistPath:', clientDistPath);
console.log('[Static Files] exists:', fs.existsSync(clientDistPath));
console.log(
  '[Static Files] index.js exists:',
  fs.existsSync(path.join(clientDistPath, 'assets/index-CLPIbv-q.js'))
);
console.log(
  '[Static Files] index.css exists:',
  fs.existsSync(path.join(clientDistPath, 'assets/index-Crc34EYu.css'))
);
if (fs.existsSync(clientDistPath)) {
  app.use('/assets', express.static(path.join(clientDistPath, 'assets')));
  app.use(express.static(clientDistPath));

  // SPA fallback for React Router paths
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middleware (only for unmatched /api routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDemoData();
    const serverInstance = app.listen(PORT, () => {
      console.log(
        `[Server] College Complaint Management System (Unified Frontend + Backend) running in ${
          process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
      );
    });
    return serverInstance;
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// If run directly, start automatically
let serverPromise = null;
if (require.main === module) {
  serverPromise = startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = { app, startServer, serverPromise };
