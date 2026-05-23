import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import appsRouter from './routes/apps';

const app = express();
const port = Number(process.env.PORT) || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
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
