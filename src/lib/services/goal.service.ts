import { prisma } from "@/lib/db";
import { GoalInput, GoalUpdateInput } from "@/lib/validations/goal";

export class GoalService {
  static async getGoalsByUserId(userId: string, filters?: any) {
    return prisma.goal.findMany({
      where: { userId, ...filters },
      include: { health: true, quality: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getGoalById(id: string, userId: string) {
    return prisma.goal.findFirst({
      where: { id, userId },
      include: {
        health: true,
        quality: true,
        milestones: { orderBy: { order: 'asc' } },
        reviews: { orderBy: { createdAt: 'desc' } },
        conflicts: true,
      },
    });
  }

  static async createGoal(userId: string, data: GoalInput) {
    const goal = await prisma.goal.create({
      data: { ...data, userId },
    });
    // Trigger health calculation (background job later)
    return goal;
  }

  static async updateGoal(id: string, userId: string, data: GoalUpdateInput) {
    const goal = await prisma.goal.update({
      where: { id, userId },
      data,
    });
    return goal;
  }

  static async deleteGoal(id: string, userId: string) {
    // Check for dependencies
    const projects = await prisma.project.count({ where: { goalId: id } });
    const tasks = await prisma.task.count({ where: { goalId: id } });
    if (projects > 0 || tasks > 0) {
      throw new Error('لا يمكن حذف الهدف لأنه مرتبط بمشاريع أو مهام');
    }
    return prisma.goal.delete({ where: { id, userId } });
  }

  static async completeGoal(id: string, userId: string) {
    const updated = await prisma.goal.update({
      where: { id, userId },
      data: { status: 'completed', progress: 100, completedAt: new Date() },
    });
    // Award XP and achievements (background job)
    return updated;
  }

  static async getStatistics(userId: string) {
    const [total, completed, active, paused, archived] = await Promise.all([
      prisma.goal.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, status: 'completed' } }),
      prisma.goal.count({ where: { userId, status: 'active' } }),
      prisma.goal.count({ where: { userId, status: 'paused' } }),
      prisma.goal.count({ where: { userId, status: 'archived' } }),
    ]);
    const avgProgress = await prisma.goal.aggregate({
      where: { userId },
      _avg: { progress: true },
    });
    return { total, completed, active, paused, archived, avgProgress: avgProgress._avg.progress || 0 };
  }
}
