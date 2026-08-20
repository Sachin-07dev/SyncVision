import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { migrate } from './migrate.mjs';
import authRoutes from './routes/auth.mjs';
import boardRoutes from './routes/boards.mjs';
import sessionRoutes from './routes/sessions.mjs';
import aiRoutes from './routes/ai.mjs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── Health check ─────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);

// ── Start ────────────────────────────────────
async function start() {
  try {
    await migrate();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    console.log('⚠️  Server running without database — set DATABASE_URL in .env');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API server running on http://0.0.0.0:${PORT} (no DB)`);
    });
  }
}

start();
