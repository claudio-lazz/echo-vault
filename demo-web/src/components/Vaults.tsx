import { useEffect, useMemo, useState } from 'react';
import { useDataMode } from '../lib/dataMode';
import { demoVaults } from '../lib/demoData';
import { useVaultGrants } from '../lib/useVaultGrants';
import { useVaults } from '../lib/useVaults';
import { useToast } from '../lib/toast';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;

type VaultItem = (typeof demoVaults)[number] & {
  grants?: number;
  lastActivity?: string;
};

export function Vaults() {
  const { mode } = useDataMode();
  const grantsState = useVaultGrants(apiBase, mode === 'live');
  const vaultsState = useVaults(apiBase, mode === 'live');
  const [selectedVault, setSelectedVault] = useState<VaultItem | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const toast = useToast();

  useEffect(() => {
    setCopyState('idle');
  }, [selectedVault?.id]);

  const liveVaults = useMemo<VaultItem[]>(() => {
    if (!vaultsState.vaults.length) return [];
    return vaultsState.vaults.map((vault, index) => {
      const total = vault.grants?.total ?? 0;
      const counts = vault.grants?.counts ?? {};
      const revoked = counts.revoked ?? 0;
      const expired = counts.expired ?? 0;
      const active = counts.active ?? Math.max(0, total - revoked - expired);
      const status = revoked > 0 || expired > 0 ? 'degraded' : 'healthy';
      const summary = `active ${active} · revoked ${revoked} · expired ${expired}`;
      return {
        id: `VA-L${String(index + 1).padStart(2, '0')}`,
        owner: vault.owner,
        region: vault.storage || 'multi-region',
        storageGB: Math.max(12, total * 6),
        status,
        grants: total,
        lastActivity: summary
      };
    });
  }, [vaultsState.vaults]);

  const fallbackVaults = useMemo<VaultItem[]>(() => {
    if (!grantsState.grants.length) return [];
    const grouped = new Map<string, { count: number; revoked: number; latestExpiry?: number | null }>();
    grantsState.grants.forEach((grant) => {
      const entry = grouped.get(grant.owner) || { count: 0, revoked: 0, latestExpiry: null };
      entry.count += 1;
      if (grant.revoked) entry.revoked += 1;
      if (grant.expires_at && (!entry.latestExpiry || grant.expires_at > entry.latestExpiry)) {
        entry.latestExpiry = grant.expires_at;
      }
      grouped.set(grant.owner, entry);
    });

    return Array.from(grouped.entries()).map(([owner, stats], index) => {
      const storageGB = Math.max(12, stats.count * 6);
      const status = stats.revoked > 0 ? 'degraded' : 'healthy';
      const expiry = stats.latestExpiry ? new Date(stats.latestExpiry * 1000).toLocaleDateString() : 'no expiry';
      return {
        id: `VA-L${String(index + 1).padStart(2, '0')}`,
        owner,
        region: 'multi-region',
        storageGB,
        status,
        grants: stats.count,
        lastActivity: `latest expiry ${expiry}`
      };
    });
  }, [grantsState.grants]);

  const usingLive = mode === 'live' && !vaultsState.error && apiBase;
  const vaults: VaultItem[] = usingLive && liveVaults.length ? liveVaults : fallbackVaults.length ? fallbackVaults : demoVaults;
  const showLiveEmpty = usingLive && !vaultsState.loading && !vaultsState.error && liveVaults.length === 0;

  const vaultReport = useMemo(() => {
    if (!selectedVault) return '';
    const now = new Date().toISOString();
    const lines = [
      `# EchoVault vault report`,
      ``,
      `- Timestamp: ${now}`,
      `- Vault ID: ${selectedVault.id}`,
      `- Owner: ${selectedVault.owner}`,
      `- Region: ${selectedVault.region}`,
      `- Status: ${selectedVault.status}`,
      `- Storage: ${selectedVault.storageGB} GB`,
      selectedVault.grants !== undefined ? `- Active grants: ${selectedVault.grants}` : null,
      selectedVault.lastActivity ? `- Latest activity: ${selectedVault.lastActivity}` : null,
      ``,
      `## Integrity signals`,
      `- Attestation checks passing`,
      `- Storage adapter: filesystem`,
      `- On-chain strict mode: enabled`,
      ``,
      `## Notes`,
      `- `
    ].filter(Boolean);

    return lines.join('\n');
  }, [selectedVault]);

  const copyReport = async () => {
    if (!vaultReport) return;
    try {
      await navigator.clipboard.writeText(vaultReport);
      setCopyState('copied');
      toast.push('Vault report copied.', 'success');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('error');
      toast.push('Copy failed. Try again.', 'error');
      window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  const downloadReport = () => {
    if (!vaultReport || !selectedVault) return;
    const blob = new Blob([vaultReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `echovault-vault-${selectedVault.id.toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <SectionCard title="Vault inventory" subtitle="Active vaults across regions">
        {mode === 'live' && (
          <div className="mb-3 rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-[#9AA4B2]">
            {vaultsState.loading && 'Loading live vault summaries...'}
            {!vaultsState.loading && vaultsState.error && `Live data unavailable (${vaultsState.error}). Showing sample data.`}
            {!vaultsState.loading && !vaultsState.error && apiBase && (liveVaults.length
              ? `Live data connected (${liveVaults.length} vaults).`
              : 'Live data connected (0 vaults). Showing sample data.')}
            {!apiBase && 'Live data preview (demo). Configure API to connect real data.'}
          </div>
        )}
        <div className="space-y-3 text-sm">
          {showLiveEmpty && (
            <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#0f1219] px-4 py-3 text-xs text-[#9AA4B2]">
              Live is connected but returned zero vaults. Showing sample inventory below while data warms up.
            </div>
          )}
          {vaults.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#0f1219] px-4 py-3 text-xs text-[#9AA4B2]">
              No vaults to display yet. Connect live data or add a sample vault to get started.
            </div>
          ) : (
            vaults.map((vault) => (
              <div key={vault.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div>
                  <div className="font-semibold text-white">{vault.id}</div>
                  <div className="text-xs text-[#9AA4B2]">{vault.owner} · {vault.region}</div>
                  {vault.lastActivity && (
                    <div className="text-xs text-[#6E7683]">{vault.lastActivity}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-[#9AA4B2]">{vault.storageGB} GB</div>
                  <StatusPill label={vault.status} tone={vault.status === 'healthy' ? 'success' : 'warning'} />
                  <button
                    onClick={() => setSelectedVault(vault)}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-2.5 py-1 text-[11px] text-white"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      {selectedVault && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedVault(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[#1f2430] bg-[#0f1219] px-6 py-4 sm:py-5 lg:py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#9AA4B2]">Vault</div>
                <div className="text-xl font-semibold text-white">{selectedVault.id}</div>
                <div className="text-xs text-[#9AA4B2]">Owner: {selectedVault.owner}</div>
                <div className="text-xs text-[#9AA4B2]">Region: {selectedVault.region}</div>
              </div>
              <button
                onClick={() => setSelectedVault(null)}
                className="rounded-lg border border-[#2A3040] bg-[#11141c] px-2.5 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div>
                  <div className="text-xs text-[#9AA4B2]">Status</div>
                  <div className="text-white">{selectedVault.status}</div>
                </div>
                <StatusPill label={selectedVault.status} tone={selectedVault.status === 'healthy' ? 'success' : 'warning'} />
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Storage usage</div>
                <div className="text-white">{selectedVault.storageGB} GB</div>
              </div>
              {selectedVault.grants !== undefined && (
                <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                  <div className="text-xs text-[#9AA4B2]">Active grants</div>
                  <div className="text-white">{selectedVault.grants}</div>
                </div>
              )}
              {selectedVault.lastActivity && (
                <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                  <div className="text-xs text-[#9AA4B2]">Latest activity</div>
                  <div className="text-white">{selectedVault.lastActivity}</div>
                </div>
              )}
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Integrity signals</div>
                <ul className="mt-2 space-y-2 text-xs text-[#9AA4B2]">
                  <li>Attestation checks passing</li>
                  <li>Storage adapter: filesystem</li>
                  <li>On-chain strict mode: enabled</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Vault report</div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#9AA4B2]">
                  <button
                    onClick={copyReport}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-1 text-xs text-white"
                  >
                    {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy report'}
                  </button>
                  <button
                    onClick={downloadReport}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-1 text-xs text-[#9AA4B2]"
                  >
                    Download .md
                  </button>
                </div>
                <textarea
                  readOnly
                  value={vaultReport}
                  aria-label="Vault report"
                  spellCheck={false}
                  className="mt-3 h-36 w-full rounded-lg border border-[#2A3040] bg-[#0b0f17] p-3 text-[11px] text-[#9AA4B2]"
                />
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#0f1219] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Actions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs">Run integrity scan</button>
                  <button className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs">Rotate encryption keys</button>
                  <button className="rounded-lg border border-[#3d1e24] bg-[#1b1216] px-3 py-2 text-xs text-[#F3B5B5]">Quarantine vault</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
