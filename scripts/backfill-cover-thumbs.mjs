#!/usr/bin/env node
// One-off: create the card thumbnail (cover-thumb.jpg, 640x360 q75) next to
// every existing opportunity cover in Supabase Storage (bucket
// "opportunities", objects <projectId>/cover.jpg) — the same file new uploads
// have written since Phase 2A (lib/cover-photo.ts, cover URL-import route).
//
//   node scripts/backfill-cover-thumbs.mjs            # dry run (default): no writes to Storage
//   node scripts/backfill-cover-thumbs.mjs --apply    # create missing thumbs
//
// Only CREATES cover-thumb.jpg (upsert: false) where none exists. Never
// modifies or deletes cover.jpg or anything else. Credentials are read ONLY
// from .env.reencode.local (git-ignored) and never printed.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "opportunities";
const COVER = "cover.jpg";
const THUMB = "cover-thumb.jpg";
const THUMB_W = 640;
const THUMB_H = 360;
const QUALITY = 75;
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
const storage = createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(BUCKET);

// ── log location (outside the repo, next to the Phase 1B backup) ──────────
const LOG_DIR = join(homedir(), "mozhyvo-cover-backup-2026-11-09");
const CSV = join(LOG_DIR, APPLY ? "thumbs-log.csv" : "thumbs-dry-run-log.csv");

const fmtMB = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const errMsg = (e) => (e && typeof e === "object" && "message" in e ? e.message : String(e));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Reads only (list/download): retry transient Storage errors such as
// "Too many connections issued to the database" on the free tier. Uploads are
// never retried — the first upload error stops the run.
async function withRetry(fn) {
  const waits = [3000, 10000, 30000];
  for (let attempt = 0; ; attempt++) {
    const res = await fn();
    if (!res.error || attempt >= waits.length) return res;
    console.warn(`  read failed (${errMsg(res.error)}), retrying in ${waits[attempt] / 1000}s…`);
    await sleep(waits[attempt]);
  }
}

async function listAll(prefix) {
  const out = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await withRetry(() => storage.list(prefix, { limit: PAGE, offset, sortBy: { column: "name", order: "asc" } }));
    if (error) throw new Error(`list "${prefix}" failed: ${errMsg(error)}`);
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

console.log(`Mode: ${APPLY ? "APPLY (creates cover-thumb.jpg files)" : "DRY RUN (no Storage writes)"}`);
console.log(`Project: ${new URL(URL_).hostname}  bucket: ${BUCKET}`);

// One entry per project folder that has a cover.jpg; note whether a thumb exists.
const folders = [];
for (const entry of await listAll("")) {
  if (entry.id !== null) continue; // root-level file, not a project folder
  const names = new Set((await listAll(entry.name)).filter((f) => f.id !== null).map((f) => f.name));
  if (names.has(COVER)) folders.push({ folder: entry.name, hasThumb: names.has(THUMB) });
}
console.log(`Covers found: ${folders.length}`);

mkdirSync(LOG_DIR, { recursive: true });
writeFileSync(CSV, "path,cover_bytes,thumb_bytes,thumb_wxh,status\n");
const log = (r) => appendFileSync(CSV, [r.path, r.coverBytes ?? "", r.thumbBytes ?? "", r.thumbWxH ?? "", r.status].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n");

const t = { created: 0, wouldCreate: 0, skipped: 0, coverBytes: 0, thumbBytes: 0 };

for (const [i, { folder, hasThumb }] of folders.entries()) {
  const coverPath = `${folder}/${COVER}`;
  const thumbPath = `${folder}/${THUMB}`;
  const tag = `[${i + 1}/${folders.length}] ${thumbPath}`;
  if (hasThumb) {
    t.skipped++;
    log({ path: thumbPath, status: "skipped-thumb-exists" });
    continue;
  }

  await sleep(150); // gentle on the free-tier Storage API
  const { data, error } = await withRetry(() => storage.download(coverPath));
  if (error) { console.error(`${tag}: download ${coverPath} failed: ${errMsg(error)} — stopping.`); process.exit(1); }
  const cover = Buffer.from(await data.arrayBuffer());

  const thumb = await sharp(cover)
    .rotate()
    .resize(THUMB_W, THUMB_H, { fit: "cover", position: "centre", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
  const m = await sharp(thumb).metadata();
  const thumbWxH = `${m.width}x${m.height}`;
  t.coverBytes += cover.length; t.thumbBytes += thumb.length;

  if (!APPLY) {
    t.wouldCreate++;
    log({ path: thumbPath, coverBytes: cover.length, thumbBytes: thumb.length, thumbWxH, status: "would-create" });
    continue;
  }

  const { error: upErr } = await storage.upload(thumbPath, thumb, { contentType: "image/jpeg", upsert: false, cacheControl: CACHE_CONTROL });
  if (upErr) {
    log({ path: thumbPath, coverBytes: cover.length, thumbBytes: thumb.length, thumbWxH, status: `upload-error: ${errMsg(upErr)}` });
    console.error(`${tag}: upload failed: ${errMsg(upErr)} — stopping.`);
    process.exit(1);
  }
  t.created++;
  log({ path: thumbPath, coverBytes: cover.length, thumbBytes: thumb.length, thumbWxH, status: "created" });
  console.log(`${tag}: ${thumbWxH} ${(thumb.length / 1024).toFixed(0)} KB created`);
}

console.log("\n── Summary ──");
console.log(`Covers:                  ${folders.length}`);
console.log(`${APPLY ? "Thumbs created:         " : "Thumbs to create:       "} ${APPLY ? t.created : t.wouldCreate}`);
console.log(`Skipped (thumb exists):  ${t.skipped}`);
console.log(`Covers read:             ${fmtMB(t.coverBytes)}`);
console.log(`Thumbs total:            ${fmtMB(t.thumbBytes)}`);
console.log(`CSV log:                 ${CSV}`);
