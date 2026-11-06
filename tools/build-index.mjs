#!/usr/bin/env node
// Checks every template the way XPENC's import does, then writes index.json,
// the single file xpenc.in/templates reads to list and preview them all.
//
//   node tools/build-index.mjs             check, then write index.json
//   node tools/build-index.mjs --validate  check only (pull requests)
//   node tools/build-index.mjs --check     check, and fail if index.json is stale
//
// No dependencies: Node 18+.

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Folders that hold templates, in the order the website lists them. */
const SECTIONS = [
  { id: 'quick-setups', label: 'Quick setups' },
  { id: 'community', label: 'Community' },
];

// The limits XPENC's importer enforces (lib/data/category_template_file.dart).
const FORMAT = 'xpenc-category-template';
const VERSION = 1;
const MAX_TEMPLATE_NAME = 60;
const MAX_DESCRIPTION = 400;
const MAX_CATEGORY_NAME = 40;
const MAX_CATEGORIES = 400;

// Icon keys XPENC knows (AppIcons in lib/core/app_icons.dart). Add new keys
// here when the app gains icons. A category may also use `emoji:<glyph>`.
const ICONS = new Set([
  'cash', 'bank', 'card', 'wallet', 'savings', 'pay_later', 'prepaid_balance',
  'salary', 'profit', 'gift', 'interest', 'refund', 'rent', 'food', 'groceries',
  'transport', 'bills', 'shopping', 'health', 'entertainment', 'emi',
  'education', 'travel', 'coffee', 'cafe', 'fastfood', 'breakfast', 'lunch',
  'dinner', 'bakery', 'icecream', 'pizza', 'ramen', 'bar', 'cake', 'kitchen',
  'mall', 'store', 'clothing', 'jewelry', 'car', 'taxi', 'fuel', 'train',
  'subway', 'bike', 'scooter', 'parking', 'car_repair', 'house', 'apartment',
  'electricity', 'water', 'wifi', 'gas', 'plumbing', 'repair', 'cleaning',
  'laundry', 'furniture', 'doctor', 'pharmacy', 'vaccine', 'fitness', 'spa',
  'therapy', 'gaming', 'music', 'theater', 'festival', 'park', 'beach',
  'hiking', 'soccer', 'basketball', 'pool', 'streaming', 'reading', 'laptop',
  'computer', 'phone', 'tv', 'headphones', 'print', 'briefcase', 'hotel',
  'luggage', 'map', 'baby', 'family', 'pets', 'elderly', 'donation', 'invoice',
  'loyalty', 'insurance', 'tax', 'transfer', 'person', 'bar_chart',
  'currency_exchange', 'other',
]);

// Structure only: any other field could carry personal data, so it's refused.
const TEMPLATE_KEYS = new Set(['format', 'version', 'name', 'description', 'income', 'expense']);
const CATEGORY_KEYS = new Set(['name', 'icon', 'color', 'children']);

const mode = process.argv.includes('--validate') ? 'validate'
  : process.argv.includes('--check') ? 'check' : 'write';
const inCI = !!process.env.GITHUB_ACTIONS;
let failures = 0;

function fail(file, message) {
  failures++;
  if (inCI) console.log(`::error file=${file}::${message}`);
  else console.error(`  ✗ ${file}: ${message}`);
}

const isText = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max && v === v.trim();

function checkCategory(file, kind, c, top, names) {
  const where = `${kind} › ${c && typeof c.name === 'string' ? c.name : '(unnamed)'}`;
  if (!c || typeof c !== 'object' || Array.isArray(c)) return fail(file, `${kind}: every category must be an object`), null;
  for (const k of Object.keys(c)) {
    if (!CATEGORY_KEYS.has(k)) fail(file, `${where}: unknown field "${k}" (allowed: name, icon, color, children)`);
  }
  if (!isText(c.name, MAX_CATEGORY_NAME)) {
    fail(file, `${where}: name is required, up to ${MAX_CATEGORY_NAME} characters, no spaces at the ends`);
  } else {
    const key = c.name.toLowerCase();
    if (names.has(key)) fail(file, `${where}: "${c.name}" is used twice in ${kind} — names must be unique`);
    names.add(key);
  }
  const emoji = typeof c.icon === 'string' && c.icon.startsWith('emoji:') ? c.icon.slice(6) : null;
  if (emoji !== null) {
    if (!emoji || emoji.length > 16 || /\s/.test(emoji)) fail(file, `${where}: "emoji:" needs a single emoji after it`);
  } else if (!ICONS.has(c.icon)) {
    fail(file, `${where}: unknown icon "${c.icon}" — use an XPENC icon key (see tools/build-index.mjs) or "emoji:<glyph>"`);
  }
  if (typeof c.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(c.color)) {
    fail(file, `${where}: color must look like "#16A34A"`);
  }
  let children = [];
  if (c.children !== undefined) {
    if (!top) fail(file, `${where}: categories nest two levels deep — a subcategory can't have its own`);
    else if (!Array.isArray(c.children)) fail(file, `${where}: children must be a list`);
    else children = c.children.map((ch) => checkCategory(file, kind, ch, false, names)).filter(Boolean);
  }
  const out = { name: c.name, icon: c.icon, color: typeof c.color === 'string' ? c.color.toUpperCase() : c.color };
  if (children.length) out.children = children;
  return out;
}

function checkTemplate(file, text) {
  if (text.charCodeAt(0) === 0xfeff) return fail(file, 'remove the byte-order mark (save as UTF-8 without BOM)'), null;
  let t;
  try { t = JSON.parse(text); } catch (e) { return fail(file, `not valid JSON: ${e.message}`), null; }
  if (!t || typeof t !== 'object' || Array.isArray(t)) return fail(file, 'must be a JSON object'), null;
  if (t.format !== FORMAT) return fail(file, `"format" must be "${FORMAT}" — export it from XPENC with Share as file`), null;
  if (t.version !== VERSION) fail(file, `"version" must be ${VERSION}`);
  for (const k of Object.keys(t)) {
    if (!TEMPLATE_KEYS.has(k)) fail(file, `unknown field "${k}" — templates hold structure only`);
  }
  if (!isText(t.name, MAX_TEMPLATE_NAME)) fail(file, `"name" is required, up to ${MAX_TEMPLATE_NAME} characters`);
  if (!isText(t.description, MAX_DESCRIPTION)) {
    fail(file, `"description" is required, up to ${MAX_DESCRIPTION} characters — say who it's for`);
  }
  const lists = {};
  for (const kind of ['income', 'expense']) {
    const raw = t[kind];
    if (!Array.isArray(raw) || raw.length === 0) {
      fail(file, `"${kind}" needs at least one category — switching to a template archives the ${kind === 'income' ? 'money-in' : 'money-out'} categories it leaves out`);
      lists[kind] = [];
      continue;
    }
    const names = new Set();
    lists[kind] = raw.map((c) => checkCategory(file, kind, c, true, names)).filter(Boolean);
  }
  const count = [...lists.income, ...lists.expense].reduce((n, c) => n + 1 + (c.children?.length ?? 0), 0);
  if (count > MAX_CATEGORIES) fail(file, `${count} categories — XPENC imports at most ${MAX_CATEGORIES}`);
  return { name: t.name, description: t.description, count, income: lists.income, expense: lists.expense };
}

const templates = [];
const ids = new Map();
for (const section of SECTIONS) {
  const dir = join(ROOT, section.id);
  if (!existsSync(dir)) continue;
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isFile() || entry.name.toLowerCase() === 'readme.md' || entry.name === '.gitkeep') continue;
    const path = `${section.id}/${entry.name}`;
    const m = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/.exec(entry.name);
    if (!m) { fail(path, 'file names are lower-case-with-dashes.json, e.g. "freelancer.json"'); continue; }
    const id = m[1];
    if (ids.has(id)) { fail(path, `"${id}" is already taken by ${ids.get(id)} — pick another file name`); continue; }
    ids.set(id, path);
    const t = checkTemplate(path, readFileSync(join(dir, entry.name), 'utf8'));
    if (t) templates.push({ id, section: section.id, path, ...t });
  }
}

const order = new Map(SECTIONS.map((s, i) => [s.id, i]));
templates.sort((a, b) => order.get(a.section) - order.get(b.section) || a.name.localeCompare(b.name, 'en'));

if (failures) {
  console.error(`\n${failures} problem${failures === 1 ? '' : 's'} found.`);
  process.exit(1);
}

const index = JSON.stringify({ format: 'xpenc-template-index', version: 1, sections: SECTIONS, templates }, null, 2) + '\n';
const indexPath = join(ROOT, 'index.json');
console.log(`${templates.length} template${templates.length === 1 ? '' : 's'} OK.`);

if (mode === 'check') {
  const current = existsSync(indexPath) ? readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n') : '';
  if (current !== index) {
    console.error('index.json is out of date — run: node tools/build-index.mjs');
    process.exit(1);
  }
} else if (mode === 'write') {
  writeFileSync(indexPath, index);
  console.log('Wrote index.json.');
}
