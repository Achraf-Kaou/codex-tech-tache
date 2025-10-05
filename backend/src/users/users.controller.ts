import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class UsersController {
  async blockUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const existingUser = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { bloqued: !existingUser.bloqued },
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to block user' });
    }
  }

  async activateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const existingUser = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { active: !existingUser.active },
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to activate user' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const existingUser = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      const deletedUser = await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });
      res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
        where: { role:'USER' ,deletedAt: null },
        include: {
            tasks: true,
        },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
        where: { id: parseInt(id), deletedAt: null },
        include: {
            tasks: true,
        },
        });
        if (!user) {
        return res.status(404).json({ error: 'user not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
}

export default new UsersController();