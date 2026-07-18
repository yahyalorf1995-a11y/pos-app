import { Goal } from "@prisma/client";

export class QualityEngine {
  static calculate(goal: Goal) {
    const clarity = this.evaluateClarity(goal);
    const realism = this.evaluateRealism(goal);
    const visionAlignment = this.evaluateVision(goal);
    const executionPlan = this.evaluateExecution(goal);
    const deadline = this.evaluateDeadline(goal);
    const measurability = this.evaluateMeasurability(goal);
    const commitment = this.evaluateCommitment(goal);

    const qualityScore = (clarity * 0.2) + (realism * 0.2) + (visionAlignment * 0.15) +
                         (executionPlan * 0.15) + (deadline * 0.1) + (measurability * 0.1) +
                         (commitment * 0.1);

    return {
      qualityScore,
      clarity,
      realism,
      visionAlignment,
      executionPlan,
      deadline,
      measurability,
      commitment,
    };
  }

  private static evaluateClarity(goal: Goal): number {
    let score = 0;
    if (goal.title && goal.title.length >= 10) score += 30;
    if (goal.description && goal.description.length >= 20) score += 40;
    const ambiguousWords = ['ربما', 'تقريباً', 'شيء ما'];
    const hasAmbiguity = ambiguousWords.some(w => (goal.description || '').includes(w));
    if (!hasAmbiguity) score += 30;
    return Math.min(100, score);
  }

  private static evaluateRealism(goal: Goal): number {
    if (!goal.targetDate) return 30;
    const daysToTarget = Math.max(0, (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysToTarget < 7) return 20;
    if (daysToTarget < 30) return 50;
    return 80;
  }

  private static evaluateVision(goal: Goal): number {
    return goal.category ? 75 : 50;
  }

  private static evaluateExecution(goal: Goal): number {
    if (!goal.steps) return 30;
    const steps = goal.steps.split('\n').filter((s: string) => s.trim().length > 0);
    if (steps.length >= 3) return 100;
    if (steps.length >= 1) return 60;
    return 30;
  }

  private static evaluateDeadline(goal: Goal): number {
    return goal.targetDate ? 80 : 20;
  }

  private static evaluateMeasurability(goal: Goal): number {
    const text = (goal.description || '') + ' ' + (goal.steps || '');
    const hasNumbers = /\d/.test(text);
    return hasNumbers ? 80 : 40;
  }

  private static evaluateCommitment(goal: Goal): number {
    return 70;
  }
}
