import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Authrouter from './auth/auth.routes';
import ProjectsRouter from './projects/projects.routes';
import TasksRouter from './tasks/tasks.routes';
import UsersRouter from './users/users.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173', // ton frontend React Vite
  credentials: true, // si tu utilises des cookies ou tokens
}));

app.use(express.json());

app.use('/api/auth', Authrouter);
app.use('/api/projects', ProjectsRouter);
app.use('/api/tasks', TasksRouter);
app.use('/api/users', UsersRouter);


app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});