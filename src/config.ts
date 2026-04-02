export const SITE = {
  website: "https://karyurid.github.io/",
  author: "KaRyuRiD",
  profile: "https://karyurid.github.io/",
  desc: "놀이터",
  title: "KaRyuRiD's 놀이터",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/satnaing/astro-paper/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "ko",
  timezone: "Asia/Seoul",
} as const;
