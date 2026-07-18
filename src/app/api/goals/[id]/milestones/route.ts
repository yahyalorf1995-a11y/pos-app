import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = firstUser.id;

  const goal = await prisma.goal.findFirst({
    where: { id: params.id, userId },
    include: { milestones: { orderBy: { order: 'asc' } } },
  });

  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: goal.milestones });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = firstUser.id;

  const body = await req.json();
  const { title, description, order } = body;

  const goal = await prisma.goal.findFirst({
    where: { id: params.id, userId },
  });

  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

  const milestone = await prisma.goalMilestone.create({
    data: {
      goalId: params.id,
      title,
      description,
      order: order || 0,
    },
  });

  return NextResponse.json({ success: true, data: milestone });
}
