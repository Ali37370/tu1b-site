/**
 * ملف الإعدادات — عدّل هنا الاسم والصور والروابط والألوان والجدول.
 * Editable site configuration: name, images, links, colors, schedule.
 */
import type { Brand } from "./brands";

export type Social = {
  id: Brand | "tip" | "shop";
  label: { ar: string; en: string };
  handle: string;
  url: string;
  color: string; // brand glow color
};

export const site = {
  name: "TU1B",
  nameAr: "تيوب",
  realName: { ar: "البراء", en: "Al-Baraa" },
  country: { ar: "السعودية", en: "Saudi Arabia" },

  kickSlug: "tu1b",
  kickUrl: "https://kick.com/tu1b",

  profileImage: "/hero-cut.png", // صورة الواجهة (مقصوصة بدون خلفية)
  portraitImage: "/portrait.jpg", // صورة قسم "عني"

  /** إيميل الأعمال — اتركه فاضي إذا ما تبي يطلع زر الإيميل */
  businessEmail: "",

  colors: {
    primary: "#a855f7",
    secondary: "#6d28d9",
    neon: "#d8b4fe",
    accent: "#22d3ee",
  },

  /** الحسابات الرئيسية (تطلع كبطاقات) */
  socials: [
    { id: "kick", label: { ar: "كيك", en: "Kick" }, handle: "TU1B", url: "https://kick.com/tu1b", color: "#53fc18" },
    { id: "youtube", label: { ar: "يوتيوب", en: "YouTube" }, handle: "@TU1B1", url: "https://www.youtube.com/@TU1B1", color: "#ff0033" },
    { id: "tiktok", label: { ar: "تيك توك", en: "TikTok" }, handle: "@.tu1b", url: "https://www.tiktok.com/@.tu1b", color: "#25f4ee" },
    { id: "instagram", label: { ar: "إنستقرام", en: "Instagram" }, handle: "@tu1b_plus", url: "https://www.instagram.com/tu1b_plus", color: "#e1306c" },
    { id: "discord", label: { ar: "ديسكورد", en: "Discord" }, handle: "TU1B", url: "https://discord.gg/TU1B", color: "#5865f2" },
    { id: "x", label: { ar: "إكس", en: "X" }, handle: "@tu1b_", url: "https://x.com/tu1b_", color: "#e7e9ea" },
  ] as Social[],

  /** حسابات إضافية (تطلع كأزرار صغيرة) */
  moreLinks: [
    { id: "youtube", label: { ar: "يوتيوب شورتس", en: "YouTube Shorts" }, handle: "@TU1BShorts", url: "https://www.youtube.com/@TU1BShorts", color: "#ff0033" },
    { id: "tiktok", label: { ar: "تيك توك إكسترا", en: "TikTok Extra" }, handle: "@tu1b.extra", url: "https://www.tiktok.com/@tu1b.extra", color: "#25f4ee" },
    { id: "snapchat", label: { ar: "سناب", en: "Snapchat" }, handle: "tu1b3", url: "https://www.snapchat.com/add/tu1b3", color: "#fffc00" },
    { id: "whatsapp", label: { ar: "قناة الواتس", en: "WhatsApp Channel" }, handle: "TU1B Family", url: "https://whatsapp.com/channel/0029Vb2msGVDJ6H3bjS04h0g", color: "#25d366" },
    { id: "tip", label: { ar: "ادعم تيوب", en: "Tip TU1B" }, handle: "DokanTIP", url: "https://tip.dokan.sa/tu1b", color: "#c084fc" },
    { id: "shop", label: { ar: "متجر النقاط", en: "Points shop" }, handle: "BotRix · !shop", url: "https://botrix.live/k/tu1b/shop", color: "#c084fc" },
  ] as Social[],

  /**
   * جدول احتياطي — يُستخدم إذا ما فيه جدول محفوظ من لوحة التحكم.
   * d: 0 = الأحد ... 6 = السبت، t: الوقت بتوقيت السعودية 24 ساعة
   */
  schedule: [] as { d: number; t: string }[],

  /** متابعين كيك المعروفين — يتحدث تلقائياً من كيك إذا توفر */
  followersFallback: 13450,

  /** اهتمامات الألعاب — أضفها هنا (تختفي إذا القائمة فاضية) */
  interests: [] as { ar: string; en: string }[],

  /** سطر التعريف في الواجهة */
  intro: {
    ar: "ستريمر صاعد على كيك. كنت على تويتش، والحين على كيك، وقريب بإذن الله على يوتيوب. وفي كل بث نسوي تحضير على السبورة.",
    en: "A rising streamer on Kick. Twitch before, Kick now, YouTube soon. And every stream, we do the roll call on the whiteboard.",
  },

  bio: {
    ar: "أنا تيوب، البراء. ستريمر صاعد على منصة كيك. بدأت مشواري ستريمر على تويتش، والحين على كيك، وبإذن الله قادم لليوتيوب بشكل جديد. وعندنا صفة خاصة في كل بث: نسوي تحضير بالسبورة، وكل اسم ينكتب عليها جزء من العائلة.",
    en: "I'm TU1B — Al-Baraa, a rising streamer on Kick. I started out streaming on Twitch, I'm on Kick now, and — God willing — coming to YouTube in a brand-new way. Every stream has our own tradition: a roll call on the whiteboard, where every name written is part of the family.",
  },

  achievements: [
    { year: { ar: "البداية", en: "Start" }, title: { ar: "ستريمر على تويتش", en: "Streaming on Twitch" } },
    { year: { ar: "الحين", en: "Now" }, title: { ar: "الانتقال لكيك وتقليد التحضير بالسبورة", en: "Moved to Kick — the whiteboard roll call began" } },
    { year: { ar: "2026", en: "2026" }, title: { ar: "+13,450 متابع على كيك", en: "13,450+ followers on Kick" } },
    { year: { ar: "قريباً", en: "Soon" }, title: { ar: "يوتيوب بشكل جديد", en: "YouTube, in a brand-new way" } },
  ],
};

export type Site = typeof site;
