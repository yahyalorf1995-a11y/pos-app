"use client";

import { useState, useEffect } from "react";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0, avgProgress: 0 });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", targetDate: "", priority: "medium",
    level: "beginner", category: "personal", steps: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, suggestedRes, statsRes] = await Promise.all([
        fetch("/api/goals?suggested=false"),
        fetch("/api/goals?suggested=true"),
        fetch("/api/goals/stats"),
      ]);
      const userGoals = await userRes.json();
      const suggestedGoals = await suggestedRes.json();
      const statsData = await statsRes.json();

      const goalsWithMilestones = await Promise.all(
        (userGoals.success ? userGoals.data : []).map(async (goal) => {
          const res = await fetch(`/api/goals/${goal.id}/milestones`);
          const data = await res.json();
          return { ...goal, milestones: data.success ? data.data : [] };
        })
      );

      setGoals(goalsWithMilestones);
      setSuggested(suggestedGoals.success ? suggestedGoals.data : []);
      setStats(statsData.success ? statsData.data : { total: 0, completed: 0, active: 0, avgProgress: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, targetDate: formData.targetDate || undefined }),
      });
      if ((await res.json()).success) {
        setFormData({ title: "", description: "", targetDate: "", priority: "medium", level: "beginner", category: "personal", steps: "" });
        setShowForm(false);
        fetchData();
      }
    } catch (error) { alert("حدث خطأ أثناء الإضافة"); }
  };

  const addSuggestedGoal = async (goal) => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goal.title,
          description: goal.description,
          priority: "medium",
          level: goal.level,
          category: goal.category,
          steps: goal.steps,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }),
      });
      if ((await res.json()).success) { fetchData(); }
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الهدف؟")) return;
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if ((await res.json()).success) fetchData();
    } catch (error) { alert("حدث خطأ أثناء الحذف"); }
  };

  const handleComplete = async (id) => {
    try {
      const res = await fetch(`/api/goals/${id}/complete`, { method: "POST" });
      if ((await res.json()).success) fetchData();
    } catch (error) { alert("حدث خطأ أثناء الإكمال"); }
  };

  const handleMilestoneToggle = async (goalId, milestoneId, completed) => {
    try {
      const res = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if ((await res.json()).success) { fetchData(); }
    } catch (error) { alert("حدث خطأ أثناء تحديث المعلم"); }
  };

  const handleAddMilestone = async (goalId) => {
    const title = prompt("أدخل عنوان المعلم الجديد:");
    if (!title) return;
    try {
      const res = await fetch(`/api/goals/${goalId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, order: 0 }),
      });
      if ((await res.json()).success) { fetchData(); }
    } catch (error) { alert("حدث خطأ أثناء إضافة المعلم"); }
  };

  const levelLabels = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };
  const categoryLabels = {
    health: "الصحة", career: "المهنة", relationships: "العلاقات",
    learning: "التعلم", spirituality: "الروحانية", personal: "شخصي"
  };
  const statusLabels = { active: "نشط", completed: "مكتمل", paused: "موقف", archived: "مؤرشف", draft: "مسودة", canceled: "ملغي" };
  const healthStatusLabels = { excellent: "🌟 ممتاز", good: "✅ جيد", struggling: "⚠️ متعثر", neglected: "🔴 مهمل", atRisk: "🚨 في خطر" };
  const healthColors = { excellent: "#10b981", good: "#3b82f6", struggling: "#f59e0b", neglected: "#ef4444", atRisk: "#dc2626" };

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>🎯 الأهداف</h1>
          <p style={{ color: "#6b7280" }}>خطة حياتك ومسار تقدمك</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "0.6rem 1.5rem", background: "#4F46E5", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>
          {showForm ? "إلغاء" : "+ هدف جديد"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>الإجمالي</p>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.total}</p>
        </div>
        <div style={{ background: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #10b981", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>مكتمل</p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>{stats.completed}</p>
        </div>
        <div style={{ background: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #3b82f6", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>نشط</p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>{stats.active}</p>
        </div>
        <div style={{ background: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #8b5cf6", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>متوسط التقدم</p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#8b5cf6" }}>{Math.round(stats.avgProgress)}%</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#f9fafb", padding: "1.5rem", borderRadius: "0.75rem", marginBottom: "2rem", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="عنوان الهدف" required style={{ gridColumn: "1 / -1", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }} />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="وصف الهدف" rows={2} style={{ gridColumn: "1 / -1", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }} />
            <select name="level" value={formData.level} onChange={handleChange} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}>
              <option value="beginner">مبتدئ</option><option value="intermediate">متوسط</option><option value="advanced">متقدم</option>
            </select>
            <select name="category" value={formData.category} onChange={handleChange} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}>
              <option value="health">الصحة</option><option value="career">المهنة</option><option value="relationships">العلاقات</option><option value="learning">التعلم</option><option value="spirituality">الروحانية</option><option value="personal">شخصي</option>
            </select>
            <input name="targetDate" type="date" value={formData.targetDate} onChange={handleChange} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }} />
            <select name="priority" value={formData.priority} onChange={handleChange} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}>
              <option value="high">عالية</option><option value="medium">متوسطة</option><option value="low">منخفضة</option>
            </select>
            <textarea name="steps" value={formData.steps} onChange={handleChange} placeholder="خطوات تحقيق الهدف" rows={2} style={{ gridColumn: "1 / -1", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }} />
            <button type="submit" style={{ gridColumn: "1 / -1", padding: "0.75rem", background: "#10B981", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>حفظ الهدف</button>
          </div>
        </form>
      )}

      <h2 style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "1rem" }}>📋 أهدافي</h2>
      {loading ? <p>جاري التحميل...</p> : goals.length === 0 ? <p style={{ color: "#6b7280" }}>لا توجد أهداف. ابدأ بإضافة هدف!</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {goals.map((g) => (
            <div key={g.id} style={{ background: "white", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>{g.title}</h3>
                <span style={{ fontSize: "0.7rem", background: "#f3f4f6", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>{statusLabels[g.status] || g.status}</span>
              </div>
              <p style={{ color: "#4b5563", fontSize: "0.9rem", margin: "0 0 0.5rem 0" }}>{g.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.7rem", background: "#e0e7ff", color: "#3730a3", padding: "0.15rem 0.6rem", borderRadius: "999px" }}>{levelLabels[g.level]}</span>
                <span style={{ fontSize: "0.7rem", background: "#fce7f3", color: "#9d174d", padding: "0.15rem 0.6rem", borderRadius: "999px" }}>{categoryLabels[g.category]}</span>
                <span style={{ fontSize: "0.7rem", background: "#fef3c7", color: "#92400e", padding: "0.15rem 0.6rem", borderRadius: "999px" }}>{g.priority}</span>
              </div>
              {g.steps && <details style={{ marginBottom: "0.5rem" }}><summary style={{ cursor: "pointer", color: "#4F46E5" }}>📋 عرض الخطوات</summary><pre style={{ whiteSpace: "pre-wrap", background: "#f3f4f6", padding: "0.5rem", borderRadius: "0.375rem", fontSize: "0.8rem" }}>{g.steps}</pre></details>}
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280" }}><span>التقدم</span><span>{Math.round(g.progress)}%</span></div>
                <div style={{ background: "#e5e7eb", borderRadius: "999px", height: "0.5rem" }}><div style={{ width: `${g.progress}%`, background: g.progress === 100 ? "#10b981" : "#4F46E5", height: "0.5rem", borderRadius: "999px" }} /></div>
              </div>

              <div style={{ marginTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#4b5563" }}>📌 المعالم</span>
                  <button onClick={() => handleAddMilestone(g.id)} style={{ fontSize: "0.7rem", color: "#4F46E5", background: "none", border: "none", cursor: "pointer" }}>+ إضافة معلم</button>
                </div>
                {g.milestones && g.milestones.length > 0 ? (
                  g.milestones.map((m) => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0", borderBottom: "1px solid #f3f4f6" }}>
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => handleMilestoneToggle(g.id, m.id, m.completed)}
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.85rem", textDecoration: m.completed ? "line-through" : "none", color: m.completed ? "#6b7280" : "#111827" }}>
                        {m.title}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>لا توجد معالم</p>
                )}
              </div>

              {g.health && (
                <div style={{ marginTop: "0.5rem", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", background: `${healthColors[g.health.riskLevel] || '#e5e7eb'}20`, border: `1px solid ${healthColors[g.health.riskLevel] || '#e5e7eb'}` }}>
                  <span style={{ fontSize: "0.7rem", color: healthColors[g.health.riskLevel] || '#6b7280' }}>
                    🩺 {healthStatusLabels[g.health.riskLevel] || g.health.riskLevel} ({Math.round(g.health.healthScore)}%)
                  </span>
                </div>
              )}
              {g.quality && (
                <div style={{ marginTop: "0.3rem" }}>
                  <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>
                    📊 جودة: {Math.round(g.quality.qualityScore)}%
                  </span>
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={() => handleComplete(g.id)} disabled={g.status === 'completed'} style={{ flex: 1, padding: "0.3rem", background: "#d1fae5", color: "#065f46", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}>✅ إكمال</button>
                <button onClick={() => handleDelete(g.id)} style={{ flex: 0.5, padding: "0.3rem", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "1rem" }}>💡 مقترحات من مختصين</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {suggested.length === 0 ? <p style={{ color: "#6b7280" }}>لا توجد اقتراحات حالياً.</p> : suggested.map((g) => (
          <div key={g.id} style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #86efac", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0 }}>{g.title}</h4>
              <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "#4b5563" }}>{g.description}</p>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>💡 {g.source} • {levelLabels[g.level]} • {categoryLabels[g.category]}</span>
            </div>
            <button onClick={() => addSuggestedGoal(g)} style={{ padding: "0.4rem 1rem", background: "#4F46E5", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>+ أضف</button>
          </div>
        ))}
      </div>
    </div>
  );
}
