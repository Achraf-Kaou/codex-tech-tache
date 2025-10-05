import { Router } from 'express';
import AuthController from './auth.controller';
import { authenticateToken } from './auth.middleware';

const Authrouter = Router();

Authrouter.post('/register', AuthController.register.bind(AuthController));
Authrouter.post('/login', AuthController.login.bind(AuthController));
Authrouter.post('/refresh',  AuthController.refresh.bind(AuthController));
Authrouter.post('/logout', authenticateToken, AuthController.logout.bind(AuthController));

export default Authrouter;