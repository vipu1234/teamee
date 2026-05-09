import type { Response, NextFunction } from 'express';
import prisma from '../utils/prisma.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const parseTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags as string[];
  if (typeof tags === 'string') { try { return JSON.parse(tags) as string[]; } catch { return []; } }
  return [];
};
const serializeTags = (tags?: string[]): string => JSON.stringify(tags ?? []);

const enrichTask = (task: any) => ({ ...task, tags: parseTags(task.tags) });

export const getMyTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const status = req.query['status'] as string | undefined;
    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId, ...(status && status !== 'ALL' ? { status } : {}) },
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tasks.map(enrichTask) });
  } catch (err) { next(err); }
};

export const getTasksByProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params['projectId'] as string;
    const userId = req.user!.id;
    const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    if (!membership) { res.status(403).json({ success: false, error: 'Access denied' }); return; }
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tasks.map(enrichTask) });
  } catch (err) { next(err); }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, description, priority, dueDate, assigneeId, projectId, tags } = req.body as {
      title: string; description?: string; priority?: string; dueDate?: string;
      assigneeId?: string; projectId: string; tags?: string[];
    };
    const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    if (!membership) { res.status(403).json({ success: false, error: 'Access denied' }); return; }
    const task = await prisma.task.create({
      data: {
        title, description,
        priority: priority ?? 'MEDIUM',
        projectId,
        creatorId: userId,
        assigneeId: assigneeId ?? userId,
        tags: serializeTags(tags),
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      },
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    res.status(201).json({ success: true, data: enrichTask(task) });
  } catch (err) { next(err); }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) { res.status(404).json({ success: false, error: 'Task not found' }); return; }
    const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: task.projectId, userId } } });
    if (!membership) { res.status(403).json({ success: false, error: 'Access denied' }); return; }
    const { title, description, status, priority, dueDate, assigneeId, tags } = req.body as {
      title?: string; description?: string; status?: string; priority?: string;
      dueDate?: string; assigneeId?: string; tags?: string[];
    };
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(assigneeId !== undefined ? { assigneeId } : {}),
        ...(tags !== undefined ? { tags: serializeTags(tags) } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      },
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    res.json({ success: true, data: enrichTask(updated) });
  } catch (err) { next(err); }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) { res.status(404).json({ success: false, error: 'Task not found' }); return; }
    const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: task.projectId, userId } } });
    if (!membership || (membership.role !== 'ADMIN' && task.creatorId !== userId)) {
      res.status(403).json({ success: false, error: 'Access denied' }); return;
    }
    await prisma.task.delete({ where: { id } });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const memberships = await prisma.projectMember.findMany({ where: { userId } });
    const projectIds = memberships.map(m => m.projectId);
    const [total, completed, inProgress, review, todo, overdue, projectCount] = await Promise.all([
      prisma.task.count({ where: { assigneeId: userId } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'REVIEW' } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'TODO' } }),
      prisma.task.count({ where: { assigneeId: userId, dueDate: { lt: now }, status: { not: 'COMPLETED' } } }),
      prisma.project.count({ where: { id: { in: projectIds } } }),
    ]);
    const allProjectTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds }, assigneeId: { not: null } },
      include: { assignee: { select: { id: true, name: true, avatar: true } } },
    });
    const userTaskMap = new Map<string, { name: string; avatar: string | null; count: number; completed: number }>();
    for (const task of allProjectTasks) {
      if (!task.assignee) continue;
      const entry = userTaskMap.get(task.assignee.id) ?? { name: task.assignee.name, avatar: task.assignee.avatar, count: 0, completed: 0 };
      entry.count++;
      if (task.status === 'COMPLETED') entry.completed++;
      userTaskMap.set(task.assignee.id, entry);
    }
    const tasksPerUser = Array.from(userTaskMap.entries()).map(([id, data]) => ({ id, ...data }));
    res.json({ success: true, data: { total, completed, inProgress, review, todo, overdue, projectCount, tasksPerUser } });
  } catch (err) { next(err); }
};
