import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs";
import path from "path";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

async function syncNotionToAstro() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  // 1. 데이터베이스에서 'Published' 상태인 글만 가져오기 (필터 설정 가능)
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "상태", // 노션 DB의 상태 속성 이름
      status: { equals: "Published" },
    },
  });

  for (const page of response.results) {

    // 2. 제목 추출
    const title = page.properties["제목"].title[0]?.plain_text || "Untitled";
    const date =
      page.properties["작성일"]?.date?.start ||
      page.created_time.split("T")[0];
    const slug = page.id.replace(/-/g, "");
    const tags = page.properties["태그"]?.multi_select?.map(t => t.name) ?? [];

    // 3. 페이지 내용을 마크다운으로 변환
    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);

    const tagsYaml = tags.length
      ? tags.map(t => `  - ${t}`).join("\n")
      : "  - notion";

    // 4. Astro 프런트매터(Frontmatter) 생성
    const content = `---
title: "${title}"
pubDatetime: ${date}
description: "Notion에서 자동 동기화된 글입니다."
slug: ${slug}
featured: false
draft: false
tags:
${tagsYaml}
---

${mdString.parent}`;

    // 5. 파일 저장 (src/content/blog 폴더가 있어야 함)
    const fileName = `${date}-${slug}.md`;
    const filePath = path.join(process.cwd(), "src/data/blog", fileName);

    fs.writeFileSync(filePath, content);
  }
}

// eslint-disable-next-line no-console
syncNotionToAstro().catch(console.error);