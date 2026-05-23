import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import appsRouter from './routes/apps';

const app = express();
const port = Number(process.env.PORT) || 3001;

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://ai-app-gen-frontend.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, mobile apps)
      if (!origin) return callback(null, true);
      // Allow any vercel.app subdomain (covers preview deployments)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
      // Allow explicitly listed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/apps', appsRouter);

app.listen(port, () => {
  console.log(`Backend API running at http://localhost:${port}`);
});
