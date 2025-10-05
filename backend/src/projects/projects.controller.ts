// projectController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
class ProjectsController {
    async createProject(req: Request, res: Response) {
    try {
        const { name } = req.body;
        if (!name) {
        return res.status(400).json({ error: 'Name is required' });
        }
        const project = await prisma.project.create({
        data: { name },
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
    };

    async getAllProjects(req: Request, res: Response) {
    try {
        const projects = await prisma.project.findMany({
        where: { deletedAt: null },
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
    };

    async getProjectById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
        where: { id: parseInt(id), deletedAt: null },
        });
        if (!project) {
        return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
    };

    async updateProject(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
        return res.status(400).json({ error: 'Name is required' });
        }
        const project = await prisma.project.update({
        where: { id: parseInt(id), deletedAt: null },
        data: { name },
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
    };

    async deleteProject(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const project = await prisma.project.update({
        where: { id: parseInt(id), deletedAt: null },
        data: { deletedAt: new Date() },
        });
        res.json({ message: 'Project deleted successfully', project });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
    }
}

export default new ProjectsController();