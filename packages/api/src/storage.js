const fs = require('fs');
const path = require('path');

const DEFAULT_STORAGE_DIR = path.join(process.cwd(), 'echovault-storage');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeKey(owner, context_uri) {
  return `${owner}:${context_uri}`;
}

async function storeBlob({ owner, context_uri, encrypted_blob }) {
  const dir = process.env.ECHOVAULT_STORAGE_DIR || DEFAULT_STORAGE_DIR;
  ensureDir(dir);
  const key = makeKey(owner, context_uri);
  const file = path.join(dir, Buffer.from(key).toString('hex') + '.json');
  fs.writeFileSync(file, JSON.stringify({ owner, context_uri, encrypted_blob }, null, 2));
  return { ok: true, location: file };
}

async function fetchBlob({ owner, context_uri }) {
  const dir = process.env.ECHOVAULT_STORAGE_DIR || DEFAULT_STORAGE_DIR;
  const key = makeKey(owner, context_uri);
  const file = path.join(dir, Buffer.from(key).toString('hex') + '.json');
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return data?.encrypted_blob || null;
}

module.exports = { storeBlob, fetchBlob };
