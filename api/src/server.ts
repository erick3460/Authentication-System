import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    message: 'API Auth-System está rodando',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor do Auth-System rodando na porta ${PORT}`);
});