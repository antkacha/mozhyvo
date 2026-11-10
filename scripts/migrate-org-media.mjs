#!/usr/bin/env node
// One-off: move base64 org images (orgs.logo_url / orgs.cover_image_url that
// start with "data:") into Storage bucket "org-media", exactly as new uploads
// are stored since Phase 3C (lib/org-media.ts): logo 256x256 WebP q85,
// cover 1600x229 WebP q80, fit cover, metadata stripped, path
// org-media/<orgId>/<kind>-<ts>.webp, cacheControl 1 year.
//
//   node scripts/migrate-org-media.mjs            # dry run (default): no writes
//   node scripts/migrate-org-media.mjs --apply    # backup → upload → update column
//
// Before any write, every original value is dumped to
// ~/mozhyvo-org-media-backup-<date>/orgs.json and verified. Only the migrated
// column is updated; nothing is ever deleted; non-data: values are untouched.
// Credentials are read ONLY from .env.reencode.local (git-ignored), never printed.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "org-media";
const SPEC = {
  logo:  { width: 256,  height: 256, quality: 85, column: "logo_url" },
  cover: { width: 1600, height: 229, quality: 80, column: "cover_image_url" },
};
const DECODABLE = ["jpeg", "png", "webp", "gif", "avif", "tiff"];
const APPLY = process.argv.includes("--apply");

// ── guard: the processing must match the app's (lib/org-media.ts) ─────────
{
  const src = readFileSync(new URL("../lib/org-media.ts", import.meta.url), "utf8");
  for (const [kind, s] of Object.entries(SPEC)) {
    const re = new RegExp(`${kind}:\\s*\\{\\s*width:\\s*${s.width},\\s*height:\\s*${s.height},\\s*quality:\\s*${s.quality},\\s*column:\\s*"${s.column}"`);
    if (!re.test(src)) { console.error(`SPEC for ${kind} no longer matches lib/org-media.ts — update this script first.`); process.exit(1); }
  }
  if (!/\.resize\(width, height, \{ fit: "cover", position: "centre" \}\)\s*\.webp\(\{ quality \}\)/.test(src)) {
    console.error("sharp pipeline in lib/org-media.ts changed — update this script first."); process.exit(1);
  }
  if (!/const ORG_MEDIA_BUCKET = "org-media"/.test(src)) { console.error("bucket name changed in lib/org-media.ts"); process.exit(1); }
}

// ── credentials: only .env.reencode.local ─────────────────────────────────
const ENV_FILE = new URL("../.env.reencode.local", import.meta.url);
if (!existsSync(ENV_FILE)) { console.error("Missing .env.reencode.local in the repo root."); process.exit(1); }
const env = {};
for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) { console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.reencode.local."); process.exit(1); }
const db = createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const today = new Date().toISOString().slice(0, 10);
const OUT_DIR = join(homedir(), `mozhyvo-org-media-backup-${today}`);
const BACKUP = join(OUT_DIR, "orgs.json");
const CSV = join(OUT_DIR, APPLY ? "migrate-log.csv" : "dry-run-log.csv");
const errMsg = (e) => (e && typeof e === "object" && "message" in e ? e.message : String(e));
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

function decodeDataUrl(v) {
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(v);
  if (!m || !m[2]) throw new Error("not a base64 data: URL");
  return { mime: m[1] ?? "?", bytes: Buffer.from(m[3], "base64") };
}

// Identical to processOrgMedia in lib/org-media.ts (minus the request-size checks).
async function processLikeApp(kind, input) {
  let { format, compression } = await sharp(input).metadata();
  if (format === "heif") { if (compression !== "av1") throw new Error("HEIC is not decodable"); format = "avif"; }
  if (!format || !DECODABLE.includes(format)) throw new Error(`unsupported format ${format}`);
  const { width, height, quality } = SPEC[kind];
  const out = await sharp(input, { animated: false })
    .rotate()
    .resize(width, height, { fit: "cover", position: "centre" })
    .webp({ quality })
    .toBuffer();
  return { out, srcFormat: format };
}

console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN (no writes)"}  project: ${new URL(URL_).hostname}`);

const { data: orgs, error } = await db
  .from("orgs")
  .select("id, slug, logo_url, cover_image_url")
  .or("logo_url.like.data:*,cover_image_url.like.data:*");
if (error) { console.error("select failed:", error.message); process.exit(1); }
console.log(`Orgs with base64 images: ${orgs.length}`);

mkdirSync(OUT_DIR, { recursive: true });

// ── backup before any write (apply only), verified ────────────────────────
if (APPLY) {
  writeFileSync(BACKUP, JSON.stringify(orgs, null, 1));
  const back = JSON.parse(readFileSync(BACKUP, "utf8"));
  const ok = back.length === orgs.length && orgs.every((o, i) =>
    back[i].id === o.id &&
    (back[i].logo_url ?? "").length === (o.logo_url ?? "").length &&
    (back[i].cover_image_url ?? "").length === (o.cover_image_url ?? "").length &&
    back[i].logo_url === o.logo_url && back[i].cover_image_url === o.cover_image_url);
  if (!ok) { console.error("Backup verification failed — nothing written."); process.exit(1); }
  console.log(`Backup written and verified: ${BACKUP} (${orgs.length} orgs)`);
}

writeFileSync(CSV, "org_id,slug,kind,old_mime,old_bytes,old_data_url_chars,new_bytes,new_wxh,url,status\n");
const log = (r) => appendFileSync(CSV, [r.id, r.slug, r.kind, r.mime, r.oldBytes, r.chars, r.newBytes ?? "", r.wxh ?? "", r.url ?? "", r.status]
  .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",") + "\n");

let done = 0, planned = 0, oldTotal = 0, newTotal = 0;
for (const org of orgs) {
  for (const kind of ["logo", "cover"]) {
    const column = SPEC[kind].column;
    const value = org[column];
    if (typeof value !== "string" || !value.startsWith("data:")) continue;
    const row = { id: org.id, slug: org.slug, kind, chars: value.length };
    try {
      const { mime, bytes } = decodeDataUrl(value);
      row.mime = mime; row.oldBytes = bytes.length;
      const { out } = await processLikeApp(kind, bytes);
      const meta = await sharp(out).metadata();
      row.newBytes = out.length; row.wxh = `${meta.width}x${meta.height}`;
      oldTotal += value.length; newTotal += out.length; planned++;

      if (!APPLY) {
        row.status = "would-migrate"; log(row);
        console.log(`  ${org.slug.padEnd(40)} ${kind.padEnd(5)} ${mime.padEnd(10)} ${kb(bytes.length).padStart(7)} (data: ${kb(value.length)}) → WebP ${row.wxh} ${kb(out.length)}`);
        continue;
      }

      const path = `${org.id}/${kind}-${Date.now()}.webp`;
      const { error: upErr } = await db.storage.from(BUCKET)
        .upload(path, out, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
      if (upErr) throw new Error(`upload failed: ${upErr.message}`);
      const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      row.url = url;

      const check = await fetch(url);
      if (check.status !== 200) throw new Error(`public URL returned ${check.status} — column NOT updated`);

      const { error: updErr } = await db.from("orgs").update({ [column]: url }).eq("id", org.id);
      if (updErr) throw new Error(`update failed: ${updErr.message} (file uploaded at ${path}, column unchanged)`);

      row.status = "migrated"; log(row); done++;
      console.log(`  ${org.slug.padEnd(40)} ${kind.padEnd(5)} → ${row.wxh} ${kb(out.length)}  migrated`);
    } catch (e) {
      row.status = `error: ${errMsg(e)}`; log(row);
      console.error(`  ${org.slug} ${kind}: ${errMsg(e)} — stopping.`);
      process.exit(1);
    }
  }
}

console.log("\n── Summary ──");
console.log(`${APPLY ? "Migrated" : "Would migrate"}: ${APPLY ? done : planned} images in ${orgs.length} orgs`);
console.log(`Base64 in DB: ${kb(oldTotal)} → WebP files: ${kb(newTotal)}`);
console.log(`CSV: ${CSV}`);
