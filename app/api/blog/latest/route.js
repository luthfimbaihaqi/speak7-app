import { NextResponse } from "next/server";
import { getLatestPosts } from "@/lib/blog/notion";

// Cache 60s — sama kayak ISR di blog pages
// Konsisten supaya gak ada race condition data antar surface
export const revalidate = 60;

export async function GET() {
  try {
    const posts = await getLatestPosts(3);

    return NextResponse.json(
      { posts },
      {
        headers: {
          // Edge cache 60s, allow stale-while-revalidate 5 menit
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[API /api/blog/latest] error:", error);
    return NextResponse.json({ posts: [] }, { status: 200 });
    // Status 200 dengan posts kosong, supaya frontend auto-hide section
    // daripada nampilin error state ugly di homepage
  }
}