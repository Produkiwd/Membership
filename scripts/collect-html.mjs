import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'html-export');
const pagesDir = path.join(outputDir, 'pages');
const siteDir = path.join(outputDir, 'site');
const ignoredDirectories = new Set(['.git', 'dist', 'html-export', 'node_modules', '.codex-worktrees', '.local-render-check']);

if (path.basename(outputDir) !== 'html-export' || path.dirname(outputDir) !== root) {
  throw new Error('Refusing to write outside the expected html-export directory.');
}

async function collectHtmlFiles(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectHtmlFiles(absolutePath, files);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(absolutePath);
    }
  }
  return files;
}

function extractTitle(html, fallback) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return (match?.[1] ?? fallback)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function copySiblingAssets(sourceHtmlPath) {
  const sourceDirectory = path.dirname(sourceHtmlPath);
  const relativeDirectory = path.relative(root, sourceDirectory);
  const targetDirectory = path.join(pagesDir, relativeDirectory);

  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name.toLowerCase().endsWith('.html')) continue;
    const source = path.join(sourceDirectory, entry.name);
    const target = path.join(targetDirectory, entry.name);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target);
  }
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(pagesDir, { recursive: true });

if (!(await stat(path.join(root, 'dist'))).isDirectory()) {
  throw new Error('dist directory is missing. Run npm run build first.');
}
await cp(path.join(root, 'dist'), siteDir, { recursive: true });

const sourceFiles = (await collectHtmlFiles(root))
  .filter((file) => path.relative(root, file) !== 'index.html')
  .sort((a, b) => a.localeCompare(b));

const hashes = new Map();
const pages = [];
const duplicates = [];

for (const sourceFile of sourceFiles) {
  const relativePath = path.relative(root, sourceFile);
  const content = await readFile(sourceFile);
  const hash = createHash('sha256').update(content).digest('hex');

  if (hashes.has(hash)) {
    duplicates.push({ source: relativePath, duplicateOf: hashes.get(hash) });
    continue;
  }

  hashes.set(hash, relativePath);
  const destination = path.join(pagesDir, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content);
  await copySiblingAssets(sourceFile);

  const html = content.toString('utf8');
  pages.push({
    title: extractTitle(html, path.basename(sourceFile, '.html')),
    source: relativePath,
    file: path.relative(outputDir, destination).split(path.sep).join('/'),
    bytes: content.byteLength,
    sha256: hash,
  });
}

const cards = pages.map((page) => `
      <a class="card" href="${encodeURI(page.file)}">
        <span class="title">${escapeHtml(page.title)}</span>
        <span class="path">${escapeHtml(page.source)}</span>
      </a>`).join('');

const catalog = `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Koleksi HTML member.sinau.tech</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #11100e; color: #f4efe5; }
    main { width: min(1080px, calc(100% - 32px)); margin: 0 auto; padding: 64px 0; }
    h1 { margin: 0 0 10px; font-size: clamp(32px, 6vw, 58px); letter-spacing: -0.04em; }
    .intro { margin: 0 0 36px; color: #b9b0a0; line-height: 1.7; }
    .site { display: inline-flex; margin-bottom: 40px; padding: 14px 20px; border-radius: 10px; background: #d4a84b; color: #16130d; font-weight: 800; text-decoration: none; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .card { min-height: 132px; padding: 22px; border: 1px solid #39342c; border-radius: 14px; background: #191714; color: inherit; text-decoration: none; transition: .18s ease; }
    .card:hover { transform: translateY(-2px); border-color: #d4a84b; background: #211e19; }
    .title { display: block; margin-bottom: 22px; font-size: 18px; font-weight: 750; line-height: 1.35; }
    .path { display: block; color: #9f9584; font: 12px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; }
    footer { margin-top: 36px; color: #817869; font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <h1>Koleksi HTML</h1>
    <p class="intro">Arsip lokal member.sinau.tech: satu build situs lengkap dan ${pages.length} halaman materi HTML mandiri.</p>
    <a class="site" href="site/index.html">Buka situs hasil build</a>
    <div class="grid">${cards}
    </div>
    <footer>Dibuat ${new Date().toISOString()} · ${duplicates.length} duplikat dilewati</footer>
  </main>
</body>
</html>`;

await writeFile(path.join(outputDir, 'index.html'), catalog, 'utf8');
await writeFile(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), site: 'site/index.html', pages, duplicates }, null, 2),
  'utf8',
);

console.log(`Exported the built site and ${pages.length} unique HTML pages to ${outputDir}`);
if (duplicates.length) console.log(`Skipped ${duplicates.length} duplicate HTML files.`);
