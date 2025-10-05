// routes/projectRoutes.ts
import { Router } from 'express';
import ProjectsController from '../projects/projects.controller'; // Adjust path as needed
import { authenticateToken } from '../auth/auth.middleware';

const ProjectsRouter = Router();

ProjectsRouter.post('/',authenticateToken, ProjectsController.createProject.bind(ProjectsController));
ProjectsRouter.get('/',authenticateToken, ProjectsController.getAllProjects.bind(ProjectsController));
ProjectsRouter.get('/:id',authenticateToken, ProjectsController.getProjectById.bind(ProjectsController));
ProjectsRouter.put('/:id',authenticateToken, ProjectsController.updateProject.bind(ProjectsController));
ProjectsRouter.delete('/:id',authenticateToken, ProjectsController.deleteProject.bind(ProjectsController));

export default ProjectsRouter;