// routes/userRoutes.ts
import { Router } from 'express';
import UsersController from './users.controller'; // Adjust path as needed
import { authenticateToken } from '../auth/auth.middleware';
import { isAdmin } from '../auth/admin.middleware'

const UsersRouter = Router();

UsersRouter.get('/', authenticateToken, isAdmin, UsersController.getAllUsers.bind(UsersController));
UsersRouter.get('/:id', authenticateToken, isAdmin, UsersController.getUserById.bind(UsersController));
UsersRouter.put('/:id/block', authenticateToken, isAdmin, UsersController.blockUser.bind(UsersController));
UsersRouter.put('/:id/activate', authenticateToken, isAdmin, UsersController.activateUser.bind(UsersController));
UsersRouter.delete('/:id', authenticateToken, isAdmin, UsersController.deleteUser.bind(UsersController));

export default UsersRouter;