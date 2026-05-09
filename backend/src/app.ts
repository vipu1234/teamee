import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.ts';

import authRoutes from './routes/auth.routes.ts';
import projectRoutes from './routes/project.routes.ts';
import taskRoutes from './routes/task.routes.ts';
import teamRoutes from './routes/team.routes.ts';

const app = express();
const PORT = process.env['PORT'] || 5000;
const FRONTEND_URL = process.env['FRONTEND_URL'] || 'http://localhost:3000';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\x1b[32m✓\x1b[0m Teamee API running at http://localhost:${PORT}`);
});

export default app;
