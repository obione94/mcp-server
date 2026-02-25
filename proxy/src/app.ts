import express from 'express';
import cors from 'cors';
import healthRoutes from './context/health/routes/healthRoute';
import chatRoutes from './context/chat/interfaces/routes/chatRoute';

const app = express();
app.use(cors());

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/chatmoi', chatRoutes);


export default app;