#!/usr/bin/env node
// One-off: re-encode existing opportunity covers in Supabase Storage
// (bucket "opportunities", objects <projectId>/cover.jpg) from 1920x1080 q85
// down to fit 1280x720, JPEG q78 mozjpeg, cacheControl 1 year — matching what
// new uploads produce since f41e5e0. Same object paths, so the ?v= URLs in
// the DB keep working.
//
//   node scripts/reencode-covers.mjs            # dry run (default): no writes to Storage
//   node scripts/reencode-covers.mjs --apply    # back up originals locally, then overwrite
//
// Credentials are read ONLY from .env.reencode.local (git-ignored). The key is
// never printed. Nothing is ever deleted.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "opportunities";
const MAX_W = 1280;
const MAX_H = 720;
const QUALITY = 78;
const CACHE_CONTROL = "31536000";
const PAGE = 100;

const APPLY = process.argv.includes("--apply");

// ── credentials: only .env.reencode.local ─────────────────────────────────
const ENV_FILE = new URL("../.env.reencode.local", import.meta.url);
if (!existsSync(ENV_FILE)) {
  console.error("Missing .env.reencode.local in the repo root.");
  process.exit(1);
}
const env = {};
for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set in .env.reencode.local.");
  process.exit(1);
}
const supabase = createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const storage = supabase.storage.from(BUCKET);

// ── output locations (outside the repo) ───────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const BACKUP_DIR = join(homedir(), `mozhyvo-cover-backup-${today}`);
const CSV = join(BACKUP_DIR, APPLY ? "reencode-log.csv" : "dry-run-log.csv");

const fmtKB = (n) => `${(n / 1024).toFixed(0)} KB`;
const fmtMB = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const errMsg = (e) => (e && typeof e === "object" && "message" in e ? e.message : String(e));

// ── listing (paginated, one level of folders) ─────────────────────────────
async function listAll(prefix) {
  const out = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await storage.list(prefix, { limit: PAGE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`list "${prefix}" failed: ${errMsg(error)}`);
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

async function listFiles() {
  const files = [];
  for (const entry of await listAll("")) {
    if (entry.id === null) {
      // folder (one per project)
      for (const f of await listAll(entry.name)) {
        if (f.id !== null) files.push({ path: `${entry.name}/${f.name}`, size: f.metadata?.size ?? null, mimetype: f.metadata?.mimetype ?? "" });
        else files.push({ path: `${entry.name}/${f.name}/`, size: null, mimetype: "folder (nested, not scanned)" });
      }
    } else if (entry.name !== ".emptyFolderPlaceholder") {
      files.push({ path: entry.name, size: entry.metadata?.size ?? null, mimetype: entry.metadata?.mimetype ?? "" });
    }
  }
  return files.filter((f) => !f.path.endsWith(".emptyFolderPlaceholder"));
}

async function download(path) {
  const { data, error } = await storage.download(path);
  if (error) throw new Error(`download ${path} failed: ${errMsg(error)}`);
  return Buffer.from(await data.arrayBuffer());
}

async function reencode(buf) {
  return sharp(buf)
    .rotate()
    .resize(MAX_W, MAX_H, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
}

// ── main ──────────────────────────────────────────────────────────────────
console.log(`Mode: ${APPLY ? "APPLY (will overwrite Storage objects)" : "DRY RUN (no Storage writes)"}`);
console.log(`Project: ${new URL(URL_).hostname}  bucket: ${BUCKET}`);
console.log(`Backup/log folder: ${BACKUP_DIR}`);

const files = await listFiles();
console.log(`Objects found: ${files.length}`);

mkdirSync(BACKUP_DIR, { recursive: true });
writeFileSync(CSV, "path,old_bytes,old_wxh,new_bytes,new_wxh,status\n");
const log = (r) => appendFileSync(CSV, [r.path, r.oldBytes ?? "", r.oldWxH ?? "", r.newBytes ?? "", r.newWxH ?? "", r.status].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n");

const t = { total: files.length, reencode: 0, done: 0, skippedSmall: 0, skippedNotSmaller: 0, nonJpeg: [], oldBytes: 0, newBytes: 0, untouchedBytes: 0 };

for (const [i, f] of files.entries()) {
  const tag = `[${i + 1}/${files.length}] ${f.path}`;
  if (f.path.endsWith("/")) { t.nonJpeg.push(`${f.path} (${f.mimetype})`); log({ path: f.path, status: "skipped-nested-folder" }); continue; }

  const isJpegName = /\.jpe?g$/i.test(f.path);
  let buf;
  try { buf = await download(f.path); } catch (e) { console.error(`${tag}: ${errMsg(e)}`); process.exit(1); }

  let meta;
  try { meta = await sharp(buf).metadata(); } catch { meta = { format: "unreadable" }; }
  if (!isJpegName || meta.format !== "jpeg") {
    t.nonJpeg.push(`${f.path} (${meta.format ?? f.mimetype}, ${fmtKB(buf.length)})`);
    log({ path: f.path, oldBytes: buf.length, oldWxH: meta.width ? `${meta.width}x${meta.height}` : "", status: "skipped-non-jpeg" });
    continue;
  }
  const oldWxH = `${meta.width}x${meta.height}`;
  if (meta.width <= MAX_W) {
    t.skippedSmall++; t.untouchedBytes += buf.length;
    log({ path: f.path, oldBytes: buf.length, oldWxH, status: "skipped-already-small" });
    continue;
  }

  const out = await reencode(buf);
  const nm = await sharp(out).metadata();
  const newWxH = `${nm.width}x${nm.height}`;
  if (out.length >= buf.length) {
    t.skippedNotSmaller++; t.untouchedBytes += buf.length;
    log({ path: f.path, oldBytes: buf.length, oldWxH, newBytes: out.length, newWxH, status: "skipped-not-smaller" });
    continue;
  }
  t.reencode++; t.oldBytes += buf.length; t.newBytes += out.length;

  if (!APPLY) {
    log({ path: f.path, oldBytes: buf.length, oldWxH, newBytes: out.length, newWxH, status: "would-reencode" });
    console.log(`${tag}: ${oldWxH} ${fmtKB(buf.length)} -> ${newWxH} ${fmtKB(out.length)} (dry run)`);
    continue;
  }

  // Backup first, verify byte-for-byte size, never overwrite an existing backup.
  const backupPath = join(BACKUP_DIR, BUCKET, f.path);
  mkdirSync(dirname(backupPath), { recursive: true });
  if (existsSync(backupPath)) {
    if (statSync(backupPath).size !== buf.length) {
      console.error(`${tag}: a different backup already exists at ${backupPath} — stopping, nothing uploaded for this file.`);
      process.exit(1);
    }
  } else {
    writeFileSync(backupPath, buf, { flag: "wx" });
  }
  if (statSync(backupPath).size !== buf.length) {
    console.error(`${tag}: backup size mismatch — stopping before upload.`);
    process.exit(1);
  }

  const { error } = await storage.upload(f.path, out, { contentType: "image/jpeg", upsert: true, cacheControl: CACHE_CONTROL });
  if (error) {
    log({ path: f.path, oldBytes: buf.length, oldWxH, newBytes: out.length, newWxH, status: `upload-error: ${errMsg(error)}` });
    console.error(`${tag}: upload failed: ${errMsg(error)} — stopping. Original is backed up at ${backupPath}.`);
    process.exit(1);
  }
  t.done++;
  log({ path: f.path, oldBytes: buf.length, oldWxH, newBytes: out.length, newWxH, status: "reencoded" });
  console.log(`${tag}: ${oldWxH} ${fmtKB(buf.length)} -> ${newWxH} ${fmtKB(out.length)} uploaded`);
}

console.log("\n── Summary ──");
console.log(`Total objects:           ${t.total}`);
console.log(`${APPLY ? "Re-encoded + uploaded:  " : "Would re-encode:        "} ${APPLY ? t.done : t.reencode}`);
console.log(`Skipped (≤${MAX_W}px wide):   ${t.skippedSmall}`);
console.log(`Skipped (not smaller):   ${t.skippedNotSmaller}`);
console.log(`Non-JPEG / skipped:      ${t.nonJpeg.length}${t.nonJpeg.length ? "\n  - " + t.nonJpeg.join("\n  - ") : ""}`);
console.log(`Re-encoded set:          ${fmtMB(t.oldBytes)} -> ${fmtMB(t.newBytes)} (${t.oldBytes ? Math.round((1 - t.newBytes / t.oldBytes) * 100) : 0}% smaller)`);
console.log(`Untouched JPEGs:         ${fmtMB(t.untouchedBytes)}`);
console.log(`CSV log:                 ${CSV}`);
