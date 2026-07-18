import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { HealthEngine } from "@/lib/engines/health.engine";
import { QualityEngine } from "@/lib/engines/quality.engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const suggested = searchParams.get('suggested') === 'true';

  // استخدام أول مستخدم موجود
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) return NextResponse.json({ success: true, data: [] });
  const userId = firstUser.id;

  const goals = await prisma.goal.findMany({
    where: {
      userId,
      ...(suggested ? { isSuggested: true } : {}),
    },
    include: {
      health: true,
      quality: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: goals });
}

export async function POST(req: NextRequest) {
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) return NextResponse.json({ error: 'No user found' }, { status: 400 });
  const userId = firstUser.id;

  const body = await req.json();
  const { title, description, steps, level, category, priority, targetDate } = body;

  const goal = await prisma.goal.create({
    data: {
      userId,
      title,
      description,
      steps,
      level: level || 'beginner',
      category: category || 'personal',
      priority: priority || 'medium',
      targetDate: targetDate ? new Date(targetDate) : null,
      status: 'active',
      progress: 0,
    },
  });

  // حساب الصحة والجودة
  const health = HealthEngine.calculate(goal);
  const quality = QualityEngine.calculate(goal);

  await prisma.goalHealth.create({ data: { ...health, goalId: goal.id } });
  await prisma.goalQuality.create({ data: { ...quality, goalId: goal.id } });

  return NextResponse.json({ success: true, data: goal });
}
