import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

const activeGrants = [
  {
    id: 'ev-2184',
    recipient: 'Orchid Labs',
    scope: 'Health data / 24h retention',
    expires: 'Feb 10, 2026 · 14:00 UTC',
    usage: '132 reads'
  },
  {
    id: 'ev-2191',
    recipient: 'Atlas Studio',
    scope: 'Context NFT #884 · read-only',
    expires: 'Feb 08, 2026 · 09:30 UTC',
    usage: '41 reads'
  },
  {
    id: 'ev-2212',
    recipient: 'Kairos AI',
    scope: 'Vault: Financial planning',
    expires: 'Feb 12, 2026 · 17:00 UTC',
    usage: '78 reads'
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

export function AccessGrants() {
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
        <div className="space-y-4">
          {activeGrants.map((grant) => (
            <div key={grant.id} className="flex flex-col gap-2 rounded-xl border border-[#242B3A] bg-[#11151f] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold">{grant.recipient}</div>
                <StatusPill label="Active" tone="success" />
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
    </div>
  );
}
