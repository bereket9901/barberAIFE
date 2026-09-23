import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler.js';
import servicesRouter from './routes/services.js';
import sessionsRouter from './routes/sessions.js';
import transactionsRouter from './routes/transactions.js';
import camerasRouter from './routes/cameras.js';
import activityRouter from './routes/activity.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'BarberAI Backend API'
  });
});

// API Routes
app.use('/api/services', servicesRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/cameras', camerasRouter);
app.use('/api/activity', activityRouter);
app.use('/api/ai', aiRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 BarberAI Backend API is running                      ║
║                                                           ║
║   📡 Server:    http://localhost:${PORT}                     ║
║   🔌 API:       http://localhost:${PORT}/api                 ║
║   💚 Health:    http://localhost:${PORT}/health              ║
║                                                           ║
║   📋 Available endpoints:                                 ║
║   • GET    /api/services                                  ║
║   • GET    /api/sessions                                  ║
║   • GET    /api/transactions                              ║
║   • GET    /api/cameras                                   ║
║   • GET    /api/cameras/status                            ║
║   • GET    /api/activity                                  ║
║   • POST   /api/ai/demo                                   ║
║   • POST   /api/ai/detect                                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
