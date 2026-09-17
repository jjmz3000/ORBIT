import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleEmailNotification } from './src/server/notificationsApi';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Endpoint para envío de correo con Resend
app.post('/api/notifications/email', async (req, res) => {
  const result = await handleEmailNotification(req.body);
  res.status(result.status).json(result.data);
});

// En producción sirve los archivos compilados de Vite (dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ORBIT (API & Notifications) escuchando en http://localhost:${PORT}`);
});
