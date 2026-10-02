# Frontend Rewind Study Hub

A dependency-free study website for Sanket's eight-week frontend revision plan. It currently contains Day 1 through Day 5, finished examples, a reusable sidebar, mobile navigation, and browser-local completion tracking.

The Markdown lesson files are the source of truth. The generated HTML pages include every lesson heading, paragraph, list, code block, table, interview answer, completion note, and source link.

## Run locally

From this folder, start any static server. For example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Add another day

1. Create the complete Markdown lesson under `Study Code/Lessons/`.
2. Add its configuration to `tools/build-lessons.mjs`.
3. Add one navigation item to `courseDays` in `assets/app.js`.
4. Add the finished example under `examples/day-XX/`.
5. Regenerate the lesson pages:

```powershell
node tools/build-lessons.mjs
```

Do not manually shorten the generated `day-XX.html` lesson content. Update the Markdown source and rebuild instead.

## GitHub Pages

The site uses relative links and deploys automatically to GitHub Pages through `.github/workflows/pages.yml` whenever `main` is pushed.

Completion is stored in the current browser's `localStorage`; it is not synchronized between devices.

