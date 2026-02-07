import fs from 'fs';
import path from 'path';

const DEFAULT_STORAGE_DIR = path.join(process.cwd(), 'echovault-storage');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeKey(owner: string, context_uri: string): string {
  return `${owner}:${context_uri}`;
}

export async function storeBlob({ owner, context_uri, encrypted_blob }: { owner: string; context_uri: string; encrypted_blob: unknown }) {
  const dir = process.env.ECHOVAULT_STORAGE_DIR || DEFAULT_STORAGE_DIR;
  ensureDir(dir);
  const key = makeKey(owner, context_uri);
  const file = path.join(dir, Buffer.from(key).toString('hex') + '.json');
  fs.writeFileSync(file, JSON.stringify({ owner, context_uri, encrypted_blob }, null, 2));
  return { ok: true, location: file };
}

export async function fetchBlob({ owner, context_uri }: { owner: string; context_uri: string }) {
  const dir = process.env.ECHOVAULT_STORAGE_DIR || DEFAULT_STORAGE_DIR;
  const key = makeKey(owner, context_uri);
  const file = path.join(dir, Buffer.from(key).toString('hex') + '.json');
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as { encrypted_blob?: unknown };
  return data?.encrypted_blob || null;
}
