import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.URL || "https://tu1b-live.netlify.app";
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/tahdeer.html`, changeFrequency: "daily", priority: 0.8 },
  ];
}
