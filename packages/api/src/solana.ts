import { Connection, PublicKey } from '@solana/web3.js';

const DEFAULT_PROGRAM_ID = 'Ech0VaulT11111111111111111111111111111111';

type ScopeInput = string | number[] | Buffer | Uint8Array | null | undefined;

type AccessGrant = {
  owner: string;
  grantee: string;
  scope_hash: string;
  expires_at: number;
  revoked: boolean;
  created_at: number;
};

type RevocationRegistry = {
  grant: string;
  revoked_at: number;
};

type ValidateResult =
  | { ok: true; grant: AccessGrant }
  | { ok: false; reason: string };

function getProgramId(): PublicKey {
  return new PublicKey(process.env.ECHOVAULT_PROGRAM_ID || DEFAULT_PROGRAM_ID);
}

function getConnection(): Connection | null {
  const rpc = process.env.ECHOVAULT_ONCHAIN_RPC;
  if (!rpc) return null;
  return new Connection(rpc, 'confirmed');
}

export function parseScopeHash(scope_hash: ScopeInput): Buffer | null {
  if (!scope_hash) return null;
  if (Array.isArray(scope_hash) && scope_hash.length === 32) return Buffer.from(scope_hash);
  if (Buffer.isBuffer(scope_hash)) return Buffer.from(scope_hash);
  if (scope_hash instanceof Uint8Array && scope_hash.length === 32) return Buffer.from(scope_hash);
  if (typeof scope_hash !== 'string') return null;
  const hex = scope_hash.startsWith('0x') ? scope_hash.slice(2) : scope_hash;
  if (/^[0-9a-fA-F]{64}$/.test(hex)) return Buffer.from(hex, 'hex');
  try {
    const decoded = (PublicKey as unknown as { tryFromBase58?: (v: string) => PublicKey }).tryFromBase58
      ? (PublicKey as unknown as { tryFromBase58: (v: string) => PublicKey }).tryFromBase58(scope_hash)
      : new PublicKey(scope_hash);
    const bytes = decoded.toBytes();
    return Buffer.from(bytes);
  } catch {
    return null;
  }
}

function readI64LE(buffer: Buffer, offset: number): number {
  const view = buffer.subarray(offset, offset + 8);
  const value = view.readBigInt64LE(0);
  return Number(value);
}

function decodeAccessGrant(data: Buffer | Uint8Array): AccessGrant {
  const buf = Buffer.from(data);
  let offset = 8; // discriminator
  const owner = new PublicKey(buf.subarray(offset, offset + 32));
  offset += 32;
  const grantee = new PublicKey(buf.subarray(offset, offset + 32));
  offset += 32;
  const scope_hash = buf.subarray(offset, offset + 32);
  offset += 32;
  const expires_at = readI64LE(buf, offset);
  offset += 8;
  const revoked = buf.readUInt8(offset) === 1;
  offset += 1;
  const created_at = readI64LE(buf, offset);
  return {
    owner: owner.toBase58(),
    grantee: grantee.toBase58(),
    scope_hash: scope_hash.toString('hex'),
    expires_at,
    revoked,
    created_at
  };
}

function decodeRevocationRegistry(data: Buffer | Uint8Array): RevocationRegistry {
  const buf = Buffer.from(data);
  let offset = 8;
  const grant = new PublicKey(buf.subarray(offset, offset + 32));
  offset += 32;
  const revoked_at = readI64LE(buf, offset);
  return { grant: grant.toBase58(), revoked_at };
}

function deriveGrantPda({ owner, grantee, scope_hash }: { owner: string; grantee: string; scope_hash: ScopeInput }) {
  const programId = getProgramId();
  const scope = parseScopeHash(scope_hash);
  if (!scope) return null;
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('grant'), new PublicKey(owner).toBuffer(), new PublicKey(grantee).toBuffer(), scope],
    programId
  );
  return pda;
}

function deriveRevokePda({ grantPda }: { grantPda: PublicKey }) {
  const programId = getProgramId();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('revoke'), grantPda.toBuffer()],
    programId
  );
  return pda;
}

async function fetchAccessGrant({ owner, grantee, scope_hash }: { owner: string; grantee: string; scope_hash: ScopeInput }) {
  const conn = getConnection();
  if (!conn) return null;
  const grantPda = deriveGrantPda({ owner, grantee, scope_hash });
  if (!grantPda) return null;
  const account = await conn.getAccountInfo(grantPda);
  if (!account) return null;
  const grant = decodeAccessGrant(account.data);
  return { grant, grantPda };
}

async function fetchRevocation({ grantPda }: { grantPda: PublicKey }) {
  const conn = getConnection();
  if (!conn) return null;
  const revokePda = deriveRevokePda({ grantPda });
  const account = await conn.getAccountInfo(revokePda);
  if (!account) return null;
  return decodeRevocationRegistry(account.data);
}

export async function validateOnchainGrant({ owner, grantee, scope_hash }: { owner: string; grantee: string; scope_hash: ScopeInput }): Promise<ValidateResult> {
  const conn = getConnection();
  if (!conn) return { ok: false, reason: 'onchain_not_configured' };
  const fetched = await fetchAccessGrant({ owner, grantee, scope_hash });
  if (!fetched) return { ok: false, reason: 'grant_not_found' };
  const { grant, grantPda } = fetched;
  const now = Math.floor(Date.now() / 1000);
  if (grant.revoked) return { ok: false, reason: 'grant_revoked' };
  if (grant.expires_at && grant.expires_at <= now) return { ok: false, reason: 'grant_expired' };
  const revocation = await fetchRevocation({ grantPda });
  if (revocation) return { ok: false, reason: 'grant_revoked' };
  return { ok: true, grant };
}
