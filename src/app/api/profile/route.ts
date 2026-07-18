import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const userId = "user_1";
    let profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      const user = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email: "user@example.com", name: "مستخدم جديد" },
      });
      profile = await prisma.profile.create({
        data: { userId: user.id },
        include: { user: true },
      });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطأ في جلب الملف الشخصي" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = "user_1";
    const body = await request.json();
    const { bio, coreValues, strengths, weaknesses, identityStatement, lifePhilosophy } = body;

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { bio, coreValues, strengths, weaknesses, identityStatement, lifePhilosophy },
      include: { user: true },
    });

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطأ في تحديث الملف الشخصي" },
      { status: 500 }
    );
  }
}
