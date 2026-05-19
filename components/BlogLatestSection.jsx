"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PenLine, ArrowRight } from "lucide-react";
import { getTagColor, formatDate } from "@/lib/blog/helpers";

function SkeletonCard() {
  return (
    <div className="bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6 animate-pulse shadow-sm">
      <div className="h-5 w-20 bg-[#1A1A1A]/5 rounded mb-3" />
      <div className="h-6 w-3/4 bg-[#1A1A1A]/5 rounded mb-2" />
      <div className="h-6 w-1/2 bg-[#1A1A1A]/5 rounded mb-4" />
      <div className="h-4 w-full bg-[#1A1A1A]/5 rounded mb-2" />
      <div className="h-4 w-2/3 bg-[#1A1A1A]/5 rounded" />
    </div>
  );
}

export default function BlogLatestSection() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchLatest() {
      try {
        const res = await fetch("/api/blog/latest");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) {
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("[BlogLatestSection] fetch error:", err);
        if (!cancelled) {
          setError(true);
          setPosts([]);
        }
      }
    }

    fetchLatest();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error || (posts !== null && posts.length === 0)) {
    return null;
  }

  return (
    <section className="max-w-5xl mx-auto mt-20 mb-16 px-2">
      {/* Section header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4A6B8F]/10 border border-[#4A6B8F]/20 text-[#4A6B8F] text-xs font-bold uppercase tracking-widest mb-4">
          From The Blog
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight mb-3 leading-tight font-display">
          Tips & Insight Terbaru
        </h2>
        <p className="text-[#525252] text-base md:text-lg max-w-xl mx-auto">
          Panduan IELTS, beasiswa, dan studi ke luar negeri.
        </p>
      </div>

      {/* Loading */}
      {posts === null && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Articles */}
      {posts !== null && posts.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-2xl overflow-hidden hover:border-[#1A1A1A]/20 transition-colors h-full flex flex-col shadow-sm hover:shadow-md"
                >
                  {post.coverImage && (
                    <div className="relative aspect-[16/9] bg-[#F8F5EE] overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 leading-snug group-hover:text-[#D17A5C] transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-sm text-[#525252] mb-4 line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-[#525252]/70 pt-3 border-t border-[#1A1A1A]/10">
                      <span>{post.author}</span>
                      <span>·</span>
                      <time dateTime={post.publishedDate}>
                        {formatDate(post.publishedDate)}
                      </time>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link href="/blog">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white rounded-full transition-all text-sm font-bold shadow-lg"
              >
                <span>Lihat Semua Artikel</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}