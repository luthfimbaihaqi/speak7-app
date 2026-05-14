import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PenLine } from "lucide-react";
import { getAllPosts } from "@/lib/blog/notion";
import { getTagColor, formatDate } from "@/lib/blog/helpers";

// ISR — revalidate setiap 60 detik
// Publish artikel baru di Notion → max 1 menit muncul di blog, tanpa redeploy
export const revalidate = 60;

export const metadata = {
  title: "Blog — IELTS4our",
  description:
    "Tips, panduan, dan insight seputar IELTS, beasiswa, dan studi ke luar negeri. Ditulis untuk pejuang beasiswa Indonesia.",
  openGraph: {
    title: "Blog — IELTS4our",
    description:
      "Tips, panduan, dan insight seputar IELTS, beasiswa, dan studi ke luar negeri.",
    type: "website",
    url: "https://ielts4our.net/blog",
  },
};

// Email kontributor — dipake di 2 tempat (mini CTA + banner bawah)
// Naro di constant biar gampang update nanti
const CONTRIBUTOR_EMAIL = "luthfibaihaqi851@gmail.com";
const CONTRIBUTOR_SUBJECT = "Kontribusi Blog IELTS4our";
const CONTRIBUTOR_MAILTO = `mailto:${CONTRIBUTOR_EMAIL}?subject=${encodeURIComponent(
  CONTRIBUTOR_SUBJECT
)}`;

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="min-h-screen pb-20 px-4 bg-gradient-to-b from-[#0F1117] to-[#151824] selection:bg-blue-500/30 selection:text-blue-200 font-sans">
      <div className="max-w-5xl mx-auto pt-12 sm:pt-20">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-8"
        >
          ← Kembali ke beranda
        </Link>

        {/* Header */}
        <header className="mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
            IELTS4our Blog
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#E6E8EE] tracking-tight mb-4 leading-tight">
            Tips & Insight buat <br />
            <span className="text-blue-400">Pejuang Beasiswa</span>
          </h1>

          {/* 🔥 UPDATED: Shortened subheading — fokus ke positioning aja, no CTA inline */}
          <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-6">
            Panduan praktis seputar IELTS, beasiswa, dan studi ke luar negeri.
            Ditulis dari pengalaman langsung para IELTS fighter.
          </p>

          {/* 🔥 NEW: Mini CTA pill — link ke email kontributor */}
          <a
            href={CONTRIBUTOR_MAILTO}
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-full transition-all text-xs font-bold cursor-pointer"
          >
            <span className="text-slate-300">
              Punya cerita IELTS, beasiswa atau pengalaman studi ke luar negeri?
              Yuk berkontribusi di blog{" "}
              <span className="text-blue-400">ielts4our</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </a>
        </header>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="bg-[#1A1D26] border border-slate-800 rounded-3xl p-12 text-center">
            <p className="text-slate-400">
              Belum ada artikel yang dipublish. Cek lagi nanti ya!
            </p>
          </div>
        )}

        {/* Article grid */}
        {posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-[#1A1D26] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors flex flex-col"
              >
                {/* Cover image (optional) */}
                {post.coverImage && (
                  <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${getTagColor(
                            tag
                          )}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-bold text-[#E6E8EE] mb-2 leading-snug group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Byline */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-800/60">
                    <span>{post.author}</span>
                    <span>·</span>
                    <time dateTime={post.publishedDate}>
                      {formatDate(post.publishedDate)}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 🔥 NEW: Contributor CTA Banner — di akhir article grid */}
        {posts.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <div className="relative bg-[#1A1D26] border border-blue-500/20 rounded-3xl p-8 sm:p-10 overflow-hidden">
              {/* Subtle gradient accent line di top */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                  Join Sebagai Kontributor
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-[#E6E8EE] mb-3 leading-tight">
                  Punya cerita yang ingin dibagikan?
                </h2>

                <p className="text-slate-400 text-sm sm:text-base mb-6 leading-relaxed">
                  Pengalaman IELTS, journey beasiswa, atau cerita studi ke luar
                  negeri? Semuanya bisa jadi insight berharga buat pejuang
                  lain. Tulis di blog IELTS4our, kita publish.
                </p>

                <a
                  href={CONTRIBUTOR_MAILTO}
                  className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-500/20"
                >
                  <span>Hubungi Kami via Email</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <p className="text-xs text-slate-500 mt-3">
                  Atau langsung kirim ke{" "}
                  <span className="text-slate-300">{CONTRIBUTOR_EMAIL}</span>
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}