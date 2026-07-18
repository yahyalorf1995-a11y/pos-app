import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: "user_1" },
      select: { name: true, xp: true, level: true, streak: true },
    });
    if (!user) {
      // إنشاء مستخدم افتراضي إذا لم يكن موجوداً
      const newUser = await prisma.user.create({
        data: { id: "user_1", email: "user@example.com", name: "مستخدم تجريبي" },
        select: { name: true, xp: true, level: true, streak: true },
      });
      return NextResponse.json({ success: true, data: newUser });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
