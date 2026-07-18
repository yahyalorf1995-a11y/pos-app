import Link from "next/link";

export default function DashboardPage() {
  const modules = [
    { name: "الهوية", path: "/dashboard/profile" },
    { name: "الدستور", path: "/dashboard/constitution" },
    { name: "المهمة والرؤية", path: "/dashboard/mission-vision" },
    { name: "مجالات الحياة", path: "/dashboard/life-areas" },
    { name: "الأهداف", path: "/dashboard/goals" },
    { name: "المشاريع", path: "/dashboard/projects" },
    { name: "المهام", path: "/dashboard/tasks" },
    { name: "العادات", path: "/dashboard/habits" },
  ];

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>📊 لوحة التحكم</h1>
      <p style={{ color: "#6b7280" }}>اختر وحدة للبدء</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
        {modules.map((module) => (
          <Link key={module.path} href={module.path} style={{ textDecoration: "none" }}>
            <div style={{ background: "#f3f4f6", padding: "1.5rem", borderRadius: "0.5rem", textAlign: "center", fontWeight: "500", cursor: "pointer", transition: "0.2s", border: "1px solid transparent" }}>
              {module.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
