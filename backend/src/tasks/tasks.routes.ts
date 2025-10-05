import { Router } from 'express';
import TasksController from './tasks.controller'; // Adjust path as needed
import { authenticateToken } from '../auth/auth.middleware';

const TasksRouter = Router();

TasksRouter.post('/', authenticateToken, TasksController.createTask.bind(TasksController));
TasksRouter.get('/', authenticateToken, TasksController.getAllTasks.bind(TasksController));
TasksRouter.get('/:id', authenticateToken, TasksController.getTaskById.bind(TasksController));
TasksRouter.put('/:id', authenticateToken, TasksController.updateTask.bind(TasksController));

export default TasksRouter;