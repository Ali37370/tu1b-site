import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.URL || "https://tu1b-live.netlify.app";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/inquiries"] }], sitemap: `${base}/sitemap.xml` };
}
