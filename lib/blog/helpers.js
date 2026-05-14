// Tag color mapping — konsisten sama identity di homepage
// Blue = Speaking, Emerald = Writing, Purple = IELTS4our brand
// Amber = Scholarship (mirip token gold), Rose = Study Abroad
export const TAG_COLORS = {
  "IELTS Speaking": "text-blue-300 bg-blue-500/10 border-blue-500/30",
  "IELTS Writing": "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  Scholarship: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  "Study Abroad": "text-rose-300 bg-rose-500/10 border-rose-500/30",
  "IELTS4our Updates": "text-purple-300 bg-purple-500/10 border-purple-500/30",
};

export function getTagColor(tag) {
  return (
    TAG_COLORS[tag] ||
    "text-slate-300 bg-slate-500/10 border-slate-500/30"
  );
}

// Format ISO date jadi readable string (Indonesian locale)
// Konsisten sama style di homepage ("4 November 2025")
export function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Estimasi reading time dari markdown content
// Rata-rata 200 kata/menit (standar Medium)
export function calculateReadingTime(markdown) {
  if (!markdown) return 1;
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}