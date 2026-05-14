import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Mic2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getAllSlugs } from "@/lib/blog/notion";
import {
  getTagColor,
  formatDate,
  calculateReadingTime,
} from "@/lib/blog/helpers";

// ISR — sama kayak index page
export const revalidate = 60;

// Generate static params untuk build-time prerendering
// Artikel baru tetep keangkat via ISR
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Dynamic metadata per artikel
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Artikel tidak ditemukan — IELTS4our",
    };
  }

  return {
    title: `${post.title} — IELTS4our`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://ielts4our.net/blog/${post.slug}`,
      publishedTime: post.publishedDate,
      authors: [post.author],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const readingTime = calculateReadingTime(post.content);

  // JSON-LD structured data buat SEO (Google Rich Results)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.publishedDate,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "IELTS4our",
      url: "https://ielts4our.net",
    },
  };

  return (
    <main className="min-h-screen pb-20 px-4 bg-gradient-to-b from-[#0F1117] to-[#151824] selection:bg-blue-500/30 selection:text-blue-200 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto pt-12 sm:pt-20">
        {/* Back to blog */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-8"
        >
          ← Kembali ke Blog
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
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
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#E6E8EE] tracking-tight mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg text-slate-400 mb-6 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Top byline */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-10 pb-10 border-b border-slate-800">
          <span className="text-slate-300">{post.author}</span>
          <span>·</span>
          <time dateTime={post.publishedDate}>
            {formatDate(post.publishedDate)}
          </time>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden mb-10">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Article content (markdown rendered) */}
        <div
          className="prose prose-invert prose-slate max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#E6E8EE]
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
            prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-300 prose-blockquote:not-italic
            prose-ul:text-slate-300 prose-ol:text-slate-300
            prose-li:marker:text-slate-600
            prose-img:rounded-xl prose-img:border prose-img:border-slate-800
            prose-hr:border-slate-800"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Bottom byline — "Written by — Author" */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            Written by —{" "}
            <span className="text-slate-200 font-medium">{post.author}</span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Dipublikasikan pada {formatDate(post.publishedDate)}
          </p>
        </div>

        {/* CTA — drive user back ke practice */}
        <div className="mt-12 bg-[#1A1D26] border border-blue-500/20 rounded-3xl p-6 sm:p-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-3">
            Coba sekarang
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#E6E8EE] mb-2 leading-snug">
            Latihan IELTS Speaking dengan IELTS4our
          </h3>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            Dapat feedback instan dan estimasi band score. Gratis untuk dicoba.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-500/20"
          >
            <span>Mulai Latihan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </main>
  );
}