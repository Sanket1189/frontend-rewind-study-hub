import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDirectory = path.resolve(toolDirectory, "..");
const workspaceDirectory = path.resolve(siteDirectory, "..");

const lessons = [
  {
    dayId: "day-01",
    dayNumber: "01",
    source: "Study Code/Lessons/Day 01 - Semantic HTML and Accessible Forms.md",
    output: "day-01.html",
    description:
      "Learn how correct HTML gives an interface structure, keyboard behavior, accessibility, and maintainability before React is added.",
    topics: ["WEB-02", "WEB-03", "A11Y-01", "A11Y-02", "A11Y-03"],
    example: "examples/day-01/index.html",
    exampleTitle: "Day 1 semantic HTML example",
    previous: { href: "index.html", label: "Dashboard", eyebrow: "Course" },
    next: { href: "day-02.html", label: "Day 2", eyebrow: "Next lesson" },
  },
  {
    dayId: "day-02",
    dayNumber: "02",
    source: "Study Code/Lessons/Day 02 - CSS Cascade Box Model and Normal Flow.md",
    output: "day-02.html",
    description:
      "Understand how a CSS value wins and how the browser sizes and places boxes before Flexbox or Grid enters the picture.",
    topics: ["CSS-01", "CSS-02"],
    example: "examples/day-02/index.html",
    exampleTitle: "Day 2 CSS foundations example",
    previous: { href: "day-01.html", label: "Day 1", eyebrow: "Previous lesson" },
    next: { href: "day-03.html", label: "Day 3", eyebrow: "Next lesson" },
  },
  {
    dayId: "day-03",
    dayNumber: "03",
    source: "Study Code/Lessons/Day 03 - Flexbox Layout.md",
    output: "day-03.html",
    description:
      "Master Flexbox axes, alignment, sizing, wrapping, responsive patterns, and the common min-width trap.",
    topics: ["CSS-05"],
    example: "examples/day-03/index.html",
    exampleTitle: "Day 3 Flexbox header and toolbar example",
    previous: { href: "day-02.html", label: "Day 2", eyebrow: "Previous lesson" },
    next: { href: "index.html", label: "Dashboard", eyebrow: "Course" },
  },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function renderInline(value) {
  let html = escapeHtml(value);
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const text = label || target;
    return `<a href="#live-example">${text}</a>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return html;
}

function removeFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function parseMarkdown(markdown) {
  const lines = removeFrontmatter(markdown).split(/\r?\n/);
  const titleLine = lines.find((line) => line.startsWith("# ")) || "# Lesson";
  const title = titleLine.slice(2).trim();
  const titleIndex = lines.indexOf(titleLine);
  lines.splice(titleIndex, 1);

  const html = [];
  const toc = [];
  let paragraph = [];
  let listType = null;
  let sectionOpen = false;
  let codeCounter = 0;

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function closeList() {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  }

  function closeSection() {
    flushParagraph();
    closeList();
    if (sectionOpen) html.push("</section>");
    sectionOpen = false;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1] || "";

    if (line.startsWith("```")) {
      flushParagraph();
      closeList();
      const language = line.slice(3).trim();
      const codeLines = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      codeCounter += 1;
      const codeId = `lesson-code-${codeCounter}`;
      html.push(
        `<div class="code-block"><button class="copy-button" type="button" data-copy-target="${codeId}">Copy</button><code id="${codeId}"${language ? ` data-language="${escapeHtml(language)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></div>`,
      );
      continue;
    }

    if (/^\|/.test(line) && /^\|?\s*:?-+/.test(nextLine)) {
      flushParagraph();
      closeList();
      const rows = [];
      rows.push(line);
      index += 2;
      while (index < lines.length && /^\|/.test(lines[index])) {
        rows.push(lines[index]);
        index += 1;
      }
      index -= 1;
      const parseRow = (row) =>
        row
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim());
      const headers = parseRow(rows[0]);
      html.push('<div class="table-wrap"><table><thead><tr>');
      headers.forEach((header) => html.push(`<th>${renderInline(header)}</th>`));
      html.push("</tr></thead><tbody>");
      rows.slice(1).forEach((row) => {
        html.push("<tr>");
        parseRow(row).forEach((cell) => html.push(`<td>${renderInline(cell)}</td>`));
        html.push("</tr>");
      });
      html.push("</tbody></table></div>");
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugify(text);
      if (level === 2) {
        closeSection();
        const specialClass = /interview question/i.test(text)
          ? "interview-card"
          : /finished example/i.test(text)
            ? "example-panel"
            : "content-card";
        html.push(`<section class="${specialClass}" id="${id}"><h2>${renderInline(text)}</h2>`);
        sectionOpen = true;
        toc.push({ id, text: text.replace(/^\d+\.\s*/, "") });
      } else {
        html.push(`<h${level}>${renderInline(text)}</h${level}>`);
      }
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const wantedType = unordered ? "ul" : "ol";
      if (listType !== wantedType) {
        closeList();
        listType = wantedType;
        html.push(`<${listType}>`);
      }
      html.push(`<li>${renderInline((unordered || ordered)[1])}</li>`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    paragraph.push(line.trim());
  }

  closeSection();
  return { title, body: html.join("\n"), toc };
}

function renderPage(config, parsed) {
  const topicChips = config.topics
    .map((topic) => `<li class="topic-chip">${topic}</li>`)
    .join("");
  const tocItems = parsed.toc
    .map((item) => `<li><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`)
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(config.description)}" />
    <title>Day ${Number(config.dayNumber)} · ${escapeHtml(parsed.title.replace(/^Day \d+\s*-\s*/, ""))}</title>
    <link rel="stylesheet" href="assets/styles.css" />
    <script src="assets/app.js" defer></script>
  </head>
  <body data-page="lesson" data-day="${config.dayId}">
    <a class="skip-link" href="#main-content">Skip to lesson content</a>
    <div class="app-shell">
      <aside class="sidebar" id="study-sidebar" aria-label="Course navigation"></aside>
      <button class="sidebar-backdrop" data-sidebar-close aria-label="Close navigation"></button>
      <div class="content-shell">
        <header class="mobile-header">
          <button class="icon-button" type="button" data-sidebar-toggle aria-controls="study-sidebar" aria-expanded="false"><span aria-hidden="true">☰</span><span>Lessons</span></button>
          <span class="mobile-brand">Day ${config.dayNumber}</span>
        </header>
        <main id="main-content" class="page-content lesson-page">
          <header class="lesson-heading">
            <div>
              <p class="eyebrow">Day ${config.dayNumber} · About 60 minutes</p>
              <h1>${escapeHtml(parsed.title.replace(/^Day \d+\s*-\s*/, ""))}</h1>
              <p class="lesson-lead">${escapeHtml(config.description)}</p>
            </div>
            <div class="lesson-actions">
              <a class="secondary-action" href="${config.example}" target="_blank" rel="noreferrer">Open example</a>
              <button class="complete-button" type="button" data-complete-day aria-pressed="false">Mark day complete</button>
            </div>
          </header>
          <ul class="topic-list" aria-label="Topics covered">${topicChips}</ul>
          <div class="lesson-layout">
            <article class="lesson-article lesson-source">
              ${parsed.body}
              <section class="example-panel" id="live-example">
                <h2>Live example preview</h2>
                <p>This is the finished example referenced by the lesson file.</p>
                <iframe class="preview-frame" src="${config.example}" title="${escapeHtml(config.exampleTitle)}"></iframe>
              </section>
              <nav class="pagination" aria-label="Lesson pagination">
                <a href="${config.previous.href}"><small>${config.previous.eyebrow}</small><strong>← ${config.previous.label}</strong></a>
                <a href="${config.next.href}"><small>${config.next.eyebrow}</small><strong>${config.next.label} →</strong></a>
              </nav>
            </article>
            <nav class="lesson-toc" aria-label="On this page">
              <strong>Every lesson section</strong>
              <ol>${tocItems}<li><a href="#live-example">Live example preview</a></li></ol>
            </nav>
          </div>
        </main>
      </div>
    </div>
  </body>
</html>
`;
}

for (const lesson of lessons) {
  const sourcePath = path.join(workspaceDirectory, lesson.source);
  const outputPath = path.join(siteDirectory, lesson.output);
  const markdown = fs.readFileSync(sourcePath, "utf8");
  const parsed = parseMarkdown(markdown);
  fs.writeFileSync(outputPath, renderPage(lesson, parsed), "utf8");
  console.log(`Built ${lesson.output} from ${lesson.source}`);
}

