import express from 'express';
import path from 'path';
import { handleMaritimeApi } from './src/server/apiMiddleware.ts';

const app = express();
const PORT = process.env.PORT || 3000;

// API routes handled by handleMaritimeApi
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    return handleMaritimeApi(req, res, next);
  }
  next();
});

// Serve static frontend in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
