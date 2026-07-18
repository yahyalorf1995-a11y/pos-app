import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoalService } from "@/lib/services/goal.service";
import { goalUpdateSchema } from "@/lib/validations/goal";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goal = await GoalService.getGoalById(params.id, session.user.id);
  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: goal });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const validated = goalUpdateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid input', details: validated.error.errors }, { status: 400 });
  }

  const goal = await GoalService.updateGoal(params.id, session.user.id, validated.data);
  return NextResponse.json({ success: true, data: goal });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await GoalService.deleteGoal(params.id, session.user.id);
    return NextResponse.json({ success: true, message: 'Goal deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
