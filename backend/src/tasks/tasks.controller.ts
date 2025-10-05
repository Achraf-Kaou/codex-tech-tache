import { Request, Response } from 'express';
import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

class TasksController {
    async createTask(req: Request, res: Response) {
        try {
            const { name, projectId, userIds, status } = req.body;

            if (!name || !projectId) {
                return res.status(400).json({ error: 'Name and projectId are required' });
            }
            // Check if project exists
            const project = await prisma.project.findUnique({
            where: { id: projectId, deletedAt: null },
            });
            if (!project) {
            return res.status(404).json({ error: 'Project not found' });
            }
            // Check if users exist if provided
            if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            const users = await prisma.user.findMany({
                where: { 
                id: { in: userIds },
                deletedAt: null 
                },
            });
            if (users.length !== userIds.length) {
                return res.status(404).json({ error: 'One or more users not found' });
            }
            }
            const task = await prisma.task.create({
            data: {
                name,
                projectId,
                status: status || Status.PENDING,
                user: userIds && Array.isArray(userIds) ? { connect: userIds.map(id => ({ id })) } : undefined,
            },
            });
            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create task'+ error });
        }
    };

    async getAllTasks(req: Request, res: Response) {
    try {
        const tasks = await prisma.task.findMany({
        where: { deletedAt: null },
        include: {
            project: true,
            user: true,
        },
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    };

    async getTaskById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({
        where: { id: parseInt(id), deletedAt: null },
        include: {
            project: true,
            user: true,
        },
        });
        if (!task) {
        return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
    }
    };

    async updateTask(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, userIds, status } = req.body;
        // Check if task exists
        const existingTask = await prisma.task.findUnique({
        where: { id: parseInt(id), deletedAt: null },
        });
        if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
        }
        // Check if users exist if provided
        if (userIds !== undefined) {
        if (Array.isArray(userIds) && userIds.length > 0) {
            const users = await prisma.user.findMany({
            where: { 
                id: { in: userIds },
                deletedAt: null 
            },
            });
            if (users.length !== userIds.length) {
            return res.status(404).json({ error: 'One or more users not found' });
            }
        }
        }
        const updateData: any = {};
        if (name) updateData.name = name;
        if (status) updateData.status = status;
        if (userIds !== undefined) {
        updateData.user = {
            set: Array.isArray(userIds) ? userIds.map((id: number) => ({ id })) : [],
        };
        }
        const task = await prisma.task.update({
        where: { id: parseInt(id) },
        data: updateData,
        });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
    }
}

export default new TasksController();