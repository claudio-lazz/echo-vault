import { useEffect, useMemo, useState } from 'react';
import { useDataMode } from '../lib/dataMode';
import { useVaultGrants } from '../lib/useVaultGrants';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

type ActiveGrant = {
  id: string;
  recipient: string;
  scope: string;
  expires: string;
  usage: string;
  status?: 'Active' | 'Revoked';
};

const activeGrants: ActiveGrant[] = [
  {
    id: 'ev-2184',
    recipient: 'Orchid Labs',
    scope: 'Health data / 24h retention',
    expires: 'Feb 10, 2026 · 14:00 UTC',
    usage: '132 reads',
    status: 'Active'
  },
  {
    id: 'ev-2191',
    recipient: 'Atlas Studio',
    scope: 'Context NFT #884 · read-only',
    expires: 'Feb 08, 2026 · 09:30 UTC',
    usage: '41 reads',
    status: 'Active'
  },
  {
    id: 'ev-2212',
    recipient: 'Kairos AI',
    scope: 'Vault: Financial planning',
    expires: 'Feb 12, 2026 · 17:00 UTC',
    usage: '78 reads',
    status: 'Active'
  }
];

const pendingApprovals = [
  {
    id: 'req-1088',
    requester: 'Sunlit Analytics',
    scope: 'Project EchoVault / prototype transcript',
    ttl: '4 hours',
    reason: 'Model evaluation'
  },
  {
    id: 'req-1094',
    requester: 'Nimbus Partner',
    scope: 'Vault: Biometric signals',
    ttl: '2 days',
    reason: 'Onchain audit'
  }
];

const revocations = [
  {
    id: 'rvk-302',
    recipient: 'Lumen Labs',
    scope: 'Context NFT #811',
    when: 'Feb 06, 2026 · 19:22 UTC',
    status: 'Revoked'
  },
  {
    id: 'rvk-308',
    recipient: 'Dovetail AI',
    scope: 'Vault: Sleep telemetry',
    when: 'Feb 06, 2026 · 08:44 UTC',
    status: 'Expired'
  }
];

const grantDetails: Record<string, { owner: string; notes: string; activity: string[] }> = {
  'ev-2184': {
    owner: 'Damjan Vault Ops',
    notes: 'Orchid Labs is running a 24h retention audit. Access limited to anonymized health data slices.',
    activity: ['Grant issued · Feb 06', 'Usage spike detected · 2h ago', 'Auto-expiry scheduled · Feb 10']
  },
  'ev-2191': {
    owner: 'Context NFT Treasury',
    notes: 'Atlas Studio has read-only access to training transcripts for a short-term review.',
    activity: ['Grant issued · Feb 05', 'Scope verified · yesterday', 'Awaiting renewal decision · 3h']
  },
  'ev-2212': {
    owner: 'Personal Vault',
    notes: 'Kairos AI is running a financial planner model with a strict scope hash.',
    activity: ['Grant issued · Feb 04', 'Policy attestations synced · 6h', 'Renewal suggested · 1h']
  }
};

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;

export function AccessGrants() {
  const { mode } = useDataMode();
  const grantsState = useVaultGrants(apiBase, mode === 'live');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [selectedGrant, setSelectedGrant] = useState<ActiveGrant | null>(null);
  const [drawerNotice, setDrawerNotice] = useState<string | null>(null);

  useEffect(() => {
    setDrawerNotice(null);
  }, [selectedGrant]);

  const liveActive = useMemo<ActiveGrant[]>(() => {
    if (!grantsState.grants.length) return [];
    return grantsState.grants.map((grant, index) => {
      const expires = grant.expires_at
        ? new Date(grant.expires_at * 1000).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'UTC'
          })
        : 'No expiry';
      const revoked = grant.revoked === true;
      return {
        id: `ev-live-${index + 1}`,
        recipient: grant.grantee || grant.owner,
        scope: grant.scope_hash,
        expires: `${expires} UTC`,
        usage: revoked ? 'revoked' : 'live',
        status: revoked ? 'Revoked' : 'Active'
      };
    });
  }, [grantsState.grants]);

  const usingLive = mode === 'live' && !grantsState.error && apiBase;
  const grants = usingLive && liveActive.length ? liveActive : activeGrants;

  const report = useMemo(() => {
    const now = new Date().toISOString();
    const activeLines = grants
      .map((grant) => `- ${grant.recipient} · ${grant.scope} · ${grant.status ?? 'Active'} · expires ${grant.expires}`)
      .join('\n');
    const pendingLines = pendingApprovals
      .map((request) => `- ${request.requester} · ${request.scope} · TTL ${request.ttl} · ${request.reason}`)
      .join('\n');
    const revokeLines = revocations
      .map((revocation) => `- ${revocation.recipient} · ${revocation.scope} · ${revocation.status} @ ${revocation.when}`)
      .join('\n');

    return `# EchoVault access grants snapshot\n\n- Timestamp: ${now}\n- Mode: ${usingLive ? 'Live' : 'Local'}\n- Active grants: ${grants.length}\n- Pending approvals: ${pendingApprovals.length}\n- Recent revocations: ${revocations.length}\n\n## Active grants\n${activeLines || '- None'}\n\n## Pending approvals\n${pendingLines || '- None'}\n\n## Recent revocations\n${revokeLines || '- None'}\n\n## Notes\n- `;
  }, [grants, usingLive]);

  const buildGrantSummary = (grant: ActiveGrant) => {
    const detail = grantDetails[grant.id];
    const ownerLine = detail ? `- Owner: ${detail.owner}` : '- Owner: (live data)';
    const activityLines = detail?.activity?.map((item) => `- ${item}`).join('\n') ?? '- Live grant synced from API.';

    return `# EchoVault grant briefing\n\n- Generated: ${new Date().toISOString()}\n- Mode: ${usingLive ? 'Live' : 'Local'}\n- Recipient: ${grant.recipient}\n- Scope: ${grant.scope}\n- Status: ${grant.status ?? 'Active'}\n- Expires: ${grant.expires}\n- Usage: ${grant.usage}\n${ownerLine}\n\n## Notes\n${detail?.notes ?? 'Live grant details will enrich once attestation metadata is available.'}\n\n## Recent activity\n${activityLines}\n\n## Recommended follow-up\n- `;
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  const copyGrantSummary = async (grant: ActiveGrant) => {
    try {
      await navigator.clipboard.writeText(buildGrantSummary(grant));
      setDrawerNotice('Grant summary copied');
    } catch {
      setDrawerNotice('Copy failed');
    } finally {
      window.setTimeout(() => setDrawerNotice(null), 1600);
    }
  };

  const downloadGrantSummary = (grant: ActiveGrant) => {
    const blob = new Blob([buildGrantSummary(grant)], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `echovault-grant-${grant.id.toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'echovault-access-grants.md';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold">Access Grants</div>
        <div className="text-sm text-[#9AA4B2]">
          Manage consented access across Context NFTs, vaults, and sensitive records.
        </div>
      </div>

      <SectionCard
        title="Active grants"
        subtitle="Live access with auto-expiry policies"
        actions={
          <button className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-[#C8D0DD]">
            New grant
          </button>
        }
      >
        {mode === 'live' && (
          <div className="mb-4 rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-[#9AA4B2]">
            {grantsState.loading && 'Loading live grants...'}
            {!grantsState.loading && grantsState.error && `Live data unavailable (${grantsState.error}). Showing sample data.`}
            {!grantsState.loading && !grantsState.error && apiBase && `Live data connected (${grants.length} grants).`}
            {!apiBase && 'Set VITE_ECHOVAULT_API to enable live data.'}
          </div>
        )}
        <div className="space-y-4">
          {grants.map((grant) => (
            <div key={grant.id} className="flex flex-col gap-2 rounded-xl border border-[#242B3A] bg-[#11151f] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold">{grant.recipient}</div>
                <div className="flex items-center gap-2">
                  <StatusPill
                    label={grant.status ?? 'Active'}
                    tone={grant.status === 'Revoked' ? 'danger' : 'success'}
                  />
                  <button
                    onClick={() => setSelectedGrant(grant)}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-2.5 py-1 text-[11px] text-white"
                  >
                    View
                  </button>
                </div>
              </div>
              <div className="text-xs text-[#9AA4B2]">{grant.scope}</div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8B95A7]">
                <span>Expires: {grant.expires}</span>
                <span>Usage: {grant.usage}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Pending approvals" subtitle="Requests waiting for signature">
          <div className="space-y-3">
            {pendingApprovals.map((request) => (
              <div key={request.id} className="rounded-xl border border-[#242B3A] bg-[#11151f] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{request.requester}</div>
                  <StatusPill label="Needs review" tone="warning" />
                </div>
                <div className="mt-2 text-xs text-[#9AA4B2]">{request.scope}</div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#8B95A7]">
                  <span>TTL: {request.ttl}</span>
                  <span>Reason: {request.reason}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-lg bg-[#1f2430] px-3 py-1 text-xs">Approve</button>
                  <button className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-[#C8D0DD]">
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent revocations" subtitle="Auto-expired and manual revokes">
          <div className="space-y-3">
            {revocations.map((revocation) => (
              <div key={revocation.id} className="rounded-xl border border-[#242B3A] bg-[#11151f] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{revocation.recipient}</div>
                  <StatusPill label={revocation.status} tone={revocation.status === 'Revoked' ? 'danger' : 'info'} />
                </div>
                <div className="mt-2 text-xs text-[#9AA4B2]">{revocation.scope}</div>
                <div className="mt-2 text-xs text-[#8B95A7]">When: {revocation.when}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Access grants report" subtitle="Copy or download a markdown snapshot for updates">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9AA4B2]">
          <div>Auto-generated summary of active grants, approvals, and revocations.</div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-white"
              onClick={copyReport}
            >
              {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy report'}
            </button>
            <button
              className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-[#9AA4B2]"
              onClick={downloadReport}
            >
              Download .md
            </button>
          </div>
        </div>
        <textarea
          readOnly
          value={report}
          className="mt-3 h-44 w-full rounded-lg border border-[#2A3040] bg-[#0b0f17] p-3 text-xs text-[#9AA4B2]"
        />
      </SectionCard>

      {selectedGrant && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedGrant(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[#1f2430] bg-[#0f1219] px-6 py-4 sm:py-5 lg:py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#9AA4B2]">Access grant</div>
                <div className="text-xl font-semibold text-white">{selectedGrant.id}</div>
                <div className="text-xs text-[#9AA4B2]">Recipient: {selectedGrant.recipient}</div>
              </div>
              <button
                onClick={() => setSelectedGrant(null)}
                className="rounded-lg border border-[#2A3040] bg-[#11141c] px-2.5 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              {drawerNotice && (
                <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-[#9AA4B2]">
                  {drawerNotice}
                </div>
              )}
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Grant metadata</div>
                <div className="mt-3 space-y-2 text-xs text-[#9AA4B2]">
                  <div className="flex items-center justify-between">
                    <span>Scope</span>
                    <span className="text-white">{selectedGrant.scope}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <StatusPill
                      label={selectedGrant.status ?? 'Active'}
                      tone={selectedGrant.status === 'Revoked' ? 'danger' : 'success'}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Expires</span>
                    <span className="text-white">{selectedGrant.expires}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Usage</span>
                    <span className="text-white">{selectedGrant.usage}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#0f1219] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Quick actions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => copyGrantSummary(selectedGrant)}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Copy summary
                  </button>
                  <button
                    onClick={() => downloadGrantSummary(selectedGrant)}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Download .md
                  </button>
                  <button className="rounded-lg border border-[#3d1e24] bg-[#1b1216] px-3 py-2 text-xs text-[#F3B5B5]">
                    Revoke access
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Notes</div>
                <div className="text-sm text-white">
                  {grantDetails[selectedGrant.id]?.notes ?? 'Live grant details will enrich once attestation metadata is available.'}
                </div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Recent activity</div>
                <ul className="mt-2 space-y-2 text-xs text-[#9AA4B2]">
                  {(grantDetails[selectedGrant.id]?.activity ?? ['Live grant synced from API.', 'Audit trail entry created · just now']).map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
