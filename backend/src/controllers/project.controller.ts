import type { Response, NextFunction } from 'express';
import prisma from '../utils/prisma.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const projectSelect = {
  id: true, title: true, description: true, status: true, priority: true,
  deadline: true, ownerId: true, createdAt: true, updatedAt: true,
  owner: { select: { id: true, name: true, email: true, avatar: true } },
  members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } } },
  _count: { select: { tasks: true } },
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, description, priority, deadline } = req.body as { title: string; description?: string; priority?: string; deadline?: string };
    const project = await prisma.project.create({
      data: {
        title, description,
        priority: priority ?? 'MEDIUM',
        ownerId: userId,
        ...(deadline ? { deadline: new Date(deadline) } : {}),
        members: { create: { userId, role: 'ADMIN' } },
      },
      select: projectSelect,
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: { project: { select: projectSelect } },
      orderBy: { joinedAt: 'desc' },
    });
    res.json({ success: true, data: memberships.map(m => m.project) });
  } catch (err) { next(err); }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;
    const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: id, userId } } });
    if (!membership) { res.status(403).json({ success: false, error: 'Access denied' }); return; }
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;
    const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: id, userId } } });
    if (!membership || membership.role !== 'ADMIN') { res.status(403).json({ success: false, error: 'Admin access required' }); return; }
    const { title, description, status, priority, deadline } = req.body as { title?: string; description?: string; status?: string; priority?: string; deadline?: string };
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
      },
      select: projectSelect,
    });
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    if (project.ownerId !== userId) { res.status(403).json({ success: false, error: 'Only owner can delete' }); return; }
    await prisma.project.delete({ where: { id } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

export const addMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params['id'] as string;
    const userId = req.user!.id;
    const { email, role } = req.body as { email: string; role?: string };
    const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    if (!membership || membership.role !== 'ADMIN') { res.status(403).json({ success: false, error: 'Admin access required' }); return; }
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) { res.status(404).json({ success: false, error: 'User not found with this email' }); return; }
    const existing = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: targetUser.id } } });
    if (existing) { res.status(409).json({ success: false, error: 'User is already a member' }); return; }
    const newMember = await prisma.projectMember.create({
      data: { projectId, userId: targetUser.id, role: role ?? 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    res.status(201).json({ success: true, data: newMember });
  } catch (err) { next(err); }
};

export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params['id'] as string;
    const memberId = req.params['memberId'] as string;
    const userId = req.user!.id;
    const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    if (!membership || membership.role !== 'ADMIN') { res.status(403).json({ success: false, error: 'Admin access required' }); return; }
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project?.ownerId === memberId) { res.status(400).json({ success: false, error: 'Cannot remove the project owner' }); return; }
    await prisma.projectMember.deleteMany({ where: { projectId, userId: memberId } });
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};
