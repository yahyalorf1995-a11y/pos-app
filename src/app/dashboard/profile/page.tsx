"use client";

import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    bio: "",
    coreValues: "",
    strengths: "",
    weaknesses: "",
    identityStatement: "",
    lifePhilosophy: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          bio: data.data.bio || "",
          coreValues: data.data.coreValues || "",
          strengths: data.data.strengths || "",
          weaknesses: data.data.weaknesses || "",
          identityStatement: data.data.identityStatement || "",
          lifePhilosophy: data.data.lifePhilosophy || "",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        alert("تم حفظ البيانات بنجاح!");
      }
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>جاري التحميل...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>الهوية الشخصية</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>قم بتحديث معلوماتك الشخصية وقيمك</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.25rem" }}>السيرة الذاتية</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
            placeholder="اكتب نبذة عن نفسك..."
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.25rem" }}>القيم الأساسية</label>
          <input
            name="coreValues"
            value={formData.coreValues}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
            placeholder="مثل: الصدق، الإخلاص، النمو"
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.25rem" }}>نقاط القوة</label>
          <input
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
            placeholder="مثل: القيادة، التواصل، التحليل"
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.25rem" }}>نقاط الضعف</label>
          <input
            name="weaknesses"
            value={formData.weaknesses}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
            placeholder="مثل: التردد، المماطلة"
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.25rem" }}>بيان الهوية</label>
          <textarea
            name="identityStatement"
            value={formData.identityStatement}
            onChange={handleChange}
            rows={2}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
            placeholder="من أنا وما الذي يميزني؟"
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.25rem" }}>فلسفة الحياة</label>
          <textarea
            name="lifePhilosophy"
            value={formData.lifePhilosophy}
            onChange={handleChange}
            rows={2}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
            placeholder="مبادئي ونظريتي للحياة..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "0.75rem",
            backgroundColor: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {saving ? "جاري الحفظ..." : "حفظ الملف الشخصي"}
        </button>
      </form>

      {profile && (
        <div style={{ marginTop: "2rem", padding: "1rem", background: "#f9fafb", borderRadius: "0.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600" }}>البيانات المحفوظة</h2>
          <p><strong>الاسم:</strong> {profile.user?.name || "غير محدد"}</p>
          <p><strong>البريد:</strong> {profile.user?.email || "غير محدد"}</p>
        </div>
      )}
    </div>
  );
}
