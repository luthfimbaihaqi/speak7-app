import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

// Init Notion client pakai env var
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// ============================================================
// SDK v5 — Data Source Resolution
// ============================================================
// Notion SDK v5 introduce konsep "data source". Satu database
// bisa punya 1+ data source. Buat blog kita yang single-source,
// resolve data_source_id sekali aja dan cache module-level
// supaya gak hit Notion API tiap query.
// ============================================================

let cachedDataSourceId = null;

async function getDataSourceId() {
  if (cachedDataSourceId) return cachedDataSourceId;

  try {
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });

    // Single-source database — ambil yang pertama
    if (!database.data_sources || database.data_sources.length === 0) {
      console.error("[Notion] No data sources found in database");
      return null;
    }

    cachedDataSourceId = database.data_sources[0].id;
    return cachedDataSourceId;
  } catch (error) {
    console.error("[Notion] getDataSourceId error:", error);
    return null;
  }
}

// ============================================================
// Property Extractors
// ============================================================

function extractRichText(prop) {
  if (!prop) return "";
  if (prop.type === "title") {
    return prop.title.map((t) => t.plain_text).join("") || "";
  }
  if (prop.type === "rich_text") {
    return prop.rich_text.map((t) => t.plain_text).join("") || "";
  }
  return "";
}

function extractSelect(prop) {
  if (!prop || prop.type !== "select" || !prop.select) return "";
  return prop.select.name;
}

function extractMultiSelect(prop) {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select.map((s) => s.name);
}

function extractDate(prop) {
  if (!prop || prop.type !== "date" || !prop.date) return "";
  return prop.date.start;
}

function extractCoverImage(prop) {
  if (!prop || prop.type !== "files" || prop.files.length === 0) return null;
  const file = prop.files[0];
  if (file.type === "external") return file.external.url;
  if (file.type === "file") return file.file.url;
  return null;
}

function pageToMeta(page) {
  const props = page.properties;
  return {
    id: page.id,
    title: extractRichText(props.Title),
    slug: extractRichText(props.Slug),
    author: extractRichText(props.Author),
    tags: extractMultiSelect(props.Tags),
    status: extractSelect(props.Status),
    coverImage: extractCoverImage(props["Cover Image"]),
    excerpt: extractRichText(props.Excerpt),
    publishedDate: extractDate(props["Published Date"]),
  };
}

// ============================================================
// Public Functions — pake notion.dataSources.query (SDK v5)
// ============================================================

// Fetch semua artikel "Published"
// Sorted by Published Date descending (terbaru duluan)
export async function getAllPosts() {
  try {
    const dataSourceId = await getDataSourceId();
    if (!dataSourceId) return [];

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: "Status",
            select: { equals: "Published" },
          },
          {
            property: "Published Date",
            date: { is_not_empty: true },
          },
        ],
      },
      sorts: [
        {
          property: "Published Date",
          direction: "descending",
        },
      ],
    });

    return response.results.map(pageToMeta);
  } catch (error) {
    console.error("[Notion] getAllPosts error:", error);
    return [];
  }
}

// Fetch N artikel terbaru — buat BlogLatestSection di homepage
export async function getLatestPosts(limit = 3) {
  try {
    const dataSourceId = await getDataSourceId();
    if (!dataSourceId) return [];

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: "Status",
            select: { equals: "Published" },
          },
          {
            property: "Published Date",
            date: { is_not_empty: true },
          },
        ],
      },
      sorts: [
        {
          property: "Published Date",
          direction: "descending",
        },
      ],
      page_size: limit,
    });

    return response.results.map(pageToMeta);
  } catch (error) {
    console.error("[Notion] getLatestPosts error:", error);
    return [];
  }
}

// Fetch 1 artikel by slug, lengkap dengan content markdown
export async function getPostBySlug(slug) {
  try {
    const dataSourceId = await getDataSourceId();
    if (!dataSourceId) return null;

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: "Slug",
            rich_text: { equals: slug },
          },
          {
            property: "Status",
            select: { equals: "Published" },
          },
        ],
      },
      page_size: 1,
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const meta = pageToMeta(page);

    // Convert blocks ke markdown (notion-to-md tetep pake page.id)
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdBlocks);

    return {
      ...meta,
      content: mdString.parent || "",
    };
  } catch (error) {
    console.error("[Notion] getPostBySlug error:", error);
    return null;
  }
}

// Helper buat generateStaticParams — ambil semua slug
export async function getAllSlugs() {
  const posts = await getAllPosts();
  return posts.map((p) => p.slug).filter(Boolean);
}