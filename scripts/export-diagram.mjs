#!/usr/bin/env node
/**
 * 用 Pele 把一张 Mermaid 图导出成 SVG。
 *
 *   node scripts/export-diagram.mjs <文件.md|文件.mmd|-> [out.svg] [--n 2]
 *
 *   --n <i>   从 markdown 里取第 i 个 mermaid 代码块（默认 1）
 *   -         从 stdin 读图源
 *
 * 不给 out.svg 时写到输入文件旁边：foo.md 的第 2 块 → foo-2.svg，foo.mmd → foo.svg。
 * 需要 pele：在项目里 npm i -D pele，或 npm i --prefix "<本 skill 目录>" pele。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const { input, out, n } = parseArgs(process.argv.slice(2));
const text = input === '-' ? readFileSync(0, 'utf8') : readFileSync(input, 'utf8');
const source = extname(input).toLowerCase() === '.mmd' || input === '-' ? text : pickBlock(text, n);
if (!source.trim()) {
  console.error(input === '-' ? 'stdin 里没有内容。' : `没在 ${input} 里找到第 ${n} 个 mermaid 代码块。`);
  process.exit(1);
}

const { render } = await loadPele();
let result;
try {
  result = render(source, { responsive: false });
} catch (err) {
  console.error(err.message.trim()); // 行号相对代码块内部
  process.exit(1);
}

const target = out || defaultOut();
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${result.svg}\n`, 'utf8');
console.log(`${target}  ${Math.round(result.width)}x${Math.round(result.height)}`);

function parseArgs(args) {
  let input = null;
  let out = null;
  let n = 1;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--n') n = Number(args[++i]) || 1;
    else if (arg === '--help' || arg === '-h') usage(0);
    else if (arg === '-' || !arg.startsWith('-')) {
      if (input === null) input = arg;
      else if (out === null) out = arg;
    } else usage(1, `未知参数：${arg}`);
  }
  if (!input) usage(1);
  return { input, out, n };
}

function usage(code, message) {
  if (message) console.error(`${message}\n`);
  const text = `用 Pele 把一张 Mermaid 图导出成 SVG

  node scripts/export-diagram.mjs <文件.md|文件.mmd|-> [out.svg] [--n 2]

  --n <i>   从 markdown 里取第 i 个 mermaid 代码块（默认 1）
  -         从 stdin 读图源`;
  (code === 0 ? console.log : console.error)(text);
  process.exit(code);
}

function pickBlock(md, index) {
  // 只认 ```mermaid 围栏；正文若要"展示"一段 mermaid 源码，用四重反引号包住就不会被抓到。
  const blocks = [...md.matchAll(/^```mermaid[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm)].map((m) => m[1]);
  return blocks[index - 1] || '';
}

function defaultOut() {
  if (input === '-') return 'diagram.svg';
  const stem = extname(input).toLowerCase() === '.md'
    ? `${basename(input, extname(input))}-${n}`
    : basename(input, extname(input));
  return join(dirname(input), `${stem}.svg`);
}

async function loadPele() {
  try {
    return await import('pele'); // 装在 skill 目录里
  } catch {
    /* 下一个 */
  }
  try {
    return await import(pathToFileURL(createRequire(join(process.cwd(), 'package.json')).resolve('pele')).href);
  } catch {
    console.error('找不到 pele。先在项目里 `npm i -D pele`（Node >= 20），或 `npm i --prefix "<本 skill 目录>" pele`。');
    process.exit(1);
  }
}
