import type { Response, NextFunction } from 'express';
import prisma from '../utils/prisma.ts';
import type { AuthRequest } from '../middleware/auth.ts';

export const getTeamMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const projectIds = memberships.map(m => m.projectId);
    const allMembers = await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true } },
        project: { select: { id: true, title: true } },
      },
    });
    const userMap = new Map<string, { id: string; name: string; email: string; avatar: string | null; role: string; createdAt: Date; projects: { id: string; title: string; memberRole: string }[] }>();
    for (const m of allMembers) {
      const existing = userMap.get(m.user.id);
      if (existing) {
        existing.projects.push({ id: m.project.id, title: m.project.title, memberRole: m.role });
      } else {
        userMap.set(m.user.id, {
          id: m.user.id, name: m.user.name, email: m.user.email,
          avatar: m.user.avatar, role: m.user.role, createdAt: m.user.createdAt,
          projects: [{ id: m.project.id, title: m.project.title, memberRole: m.role }],
        });
      }
    }
    res.json({ success: true, data: Array.from(userMap.values()) });
  } catch (err) { next(err); }
};
