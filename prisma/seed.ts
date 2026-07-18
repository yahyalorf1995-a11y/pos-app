import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const userId = "user_1";
  
  const goals = [
    { title: "تحسين الصحة النفسية", description: "ممارسة التأمل يومياً وتقليل التوتر.", category: "health", level: "beginner", steps: "1. خصص 10 دقائق يومياً.\n2. مارس تمارين التنفس.\n3. تجنب المشتتات.", source: "د. أحمد السيد" },
    { title: "بناء عادة القراءة", description: "قراءة 20 صفحة يومياً.", category: "learning", level: "beginner", steps: "1. اختر كتاباً.\n2. اقرأ 20 صفحة.\n3. دوّن ملخصاً.", source: "مكتبة التنمية" },
    { title: "تحسين اللياقة البدنية", description: "ممارسة الرياضة 3 مرات أسبوعياً.", category: "health", level: "intermediate", steps: "1. حدد جدولاً.\n2. ابدأ بتمارين الإحماء.\n3. مارس تمارين القوة.", source: "د. خالد الزهراني" },
  ];

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { id: "suggested_" + goal.title.replace(/\s/g, "_") },
      update: {},
      create: {
        id: "suggested_" + goal.title.replace(/\s/g, "_"),
        userId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        level: goal.level,
        steps: goal.steps,
        source: goal.source,
        isSuggested: true,
        status: "active",
        progress: 0,
        priority: "medium",
      },
    });
  }

  console.log("✅ تم إضافة الأهداف المقترحة!");
}
main();
