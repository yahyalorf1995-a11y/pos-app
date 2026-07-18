import { Goal } from "@prisma/client";

export class HealthEngine {
  static calculate(goal: Goal, history: any[] = []) {
    const progress = (goal.progress / 100) * 40;
    const momentum = this.calculateMomentum(history);
    const consistency = this.calculateConsistency(history);
    const risk = this.calculateRisk(goal);

    const healthScore = (progress * 0.4) + (momentum * 0.25) + (consistency * 0.25) + ((100 - risk) * 0.1);
    const status = this.classifyHealth(healthScore);

    return {
      healthScore,
      momentum: momentum > 70 ? 'increasing' : momentum > 40 ? 'stable' : 'decreasing',
      consistency,
      riskLevel: risk > 70 ? 'high' : risk > 40 ? 'medium' : 'low',
      lastCalculatedAt: new Date(),
    };
  }

  private static calculateMomentum(history: any[]): number {
    if (history.length < 7) return 50;
    const recent = history.slice(-7);
    const changes = recent.map((h, i) => (i === 0 ? 0 : h.progress - recent[i - 1].progress));
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    return Math.min(100, Math.max(0, 50 + avgChange * 10));
  }

  private static calculateConsistency(history: any[]): number {
    if (history.length === 0) return 0;
    const activeDays = history.filter((h) => h.progress > 0).length;
    return (activeDays / history.length) * 100;
  }

  private static calculateRisk(goal: Goal): number {
    if (!goal.targetDate) return 0;
    const now = new Date();
    const target = new Date(goal.targetDate);
    const start = goal.startDate ? new Date(goal.startDate) : now;
    const totalDays = Math.max(1, (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = Math.min(100, (elapsedDays / totalDays) * 100);
    return Math.min(100, Math.max(0, (expectedProgress - goal.progress) * 2));
  }

  private static classifyHealth(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'struggling';
    if (score >= 30) return 'neglected';
    return 'atRisk';
  }
}
