import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.ts';
import { generateToken } from '../utils/jwt.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: process.env['NODE_ENV'] === 'production' ? 'none' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ success: false, error: 'Email already registered' }); return; }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).cookie('token', token, COOKIE_OPTIONS).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, createdAt: user.createdAt },
      token,
    });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      res.status(401).json({ success: false, error: 'Invalid email or password' }); return;
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, createdAt: user.createdAt },
      token,
    });
  } catch (err) { next(err); }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token').json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
    res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, createdAt: user.createdAt } });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, avatar } = req.body as { name?: string; avatar?: string };
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { ...(name ? { name } : {}), ...(avatar !== undefined ? { avatar } : {}) },
    });
    res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) { next(err); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !await bcrypt.compare(currentPassword, user.password)) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' }); return;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};
