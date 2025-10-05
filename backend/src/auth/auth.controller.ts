import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Environment variables - set these in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

interface TokenPayload {
  userId: number;
  email: string;
  role: Role;
}

// Store refresh tokens in memory (use Redis in production)
const refreshTokens: Set<string> = new Set();

class AuthController {
  // Register new user
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      const round_salt = Number(process.env.ROUND_SALT) || 12
      // Hash password
      const hashedPassword = await bcrypt.hash(password, round_salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          role: Role.USER
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      // Generate tokens
      const accessToken = this.generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = this.generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      // Store refresh token
      await this.storeRefreshToken(user.id, refreshToken, req);

      res.status(201).json({
        message: 'User registered successfully',
        user,
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Login user
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || user.deletedAt) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate tokens
      const accessToken = this.generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = this.generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      // Store refresh token
      await this.storeRefreshToken(user.id, refreshToken, req);

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Refresh access token
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      // Verify token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;

      // Check if token exists in database and is valid
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.userId,
          revoked: false,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!storedToken) {
        res.status(403).json({ error: 'Invalid or expired refresh token' });
        return;
      }

      // Generate new access token
      const accessToken = this.generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });

      // Optional: Implement token rotation for better security
      // Generate new refresh token
      const newRefreshToken = this.generateRefreshToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });

      // Revoke old token and store new one
      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revoked: true }
        }),
        prisma.refreshToken.create({
          data: {
            token: newRefreshToken,
            userId: decoded.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null
          }
        })
      ]);

      res.status(200).json({
        message: 'Token refreshed successfully',
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(403).json({ error: 'Invalid refresh token' });
        return;
      }
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Logout from all devices
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Revoke all user's refresh tokens
      await prisma.refreshToken.updateMany({
        where: {
          userId,
          revoked: false
        },
        data: {
          revoked: true
        }
      });

      res.status(200).json({ message: 'Logged out from all devices' });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get active sessions
  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const sessions = await prisma.refreshToken.findMany({
        where: {
          userId,
          revoked: false,
          expiresAt: {
            gt: new Date()
          }
        },
        select: {
          id: true,
          createdAt: true,
          expiresAt: true,
          ipAddress: true,
          userAgent: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({ sessions });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Revoke specific session
  async revokeSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { sessionId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await prisma.refreshToken.updateMany({
        where: {
          id: parseInt(sessionId),
          userId,
          revoked: false
        },
        data: {
          revoked: true
        }
      });

      res.status(200).json({ message: 'Session revoked successfully' });
    } catch (error) {
      console.error('Revoke session error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper: Store refresh token in database
  private async storeRefreshToken(
    userId: number,
    token: string,
    req: Request
  ): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null
      }
    });
  }

  // Helper: Generate access token
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: ACCESS_TOKEN_EXPIRY 
    } as jwt.SignOptions);
  }

  // Helper: Generate refresh token
  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { 
      expiresIn: REFRESH_TOKEN_EXPIRY 
    } as jwt.SignOptions);
  }

  // Cleanup expired tokens (run this periodically with a cron job)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { revoked: true }
          ]
        }
      });
      console.log('Expired tokens cleaned up');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}


export default new AuthController();