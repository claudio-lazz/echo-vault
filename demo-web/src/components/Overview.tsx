import { demoAlerts, demoMetrics, demoRecords } from '../lib/demoData';
import { SectionCard } from './SectionCard';
import { StatCard } from './StatCard';
import { StatusPill } from './StatusPill';
import { SolanaIntegration } from './SolanaIntegration';
import { useDataMode } from '../lib/dataMode';
import { useApiStatus } from '../lib/useApiStatus';
import { useGrantSummary } from '../lib/useGrantSummary';

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;

export function Overview() {
  const { mode } = useDataMode();
  const status = useApiStatus(apiBase, mode === 'live');
  const grantSummary = useGrantSummary(apiBase, mode === 'live');

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vault Health" value="99.98%" subLabel="Strict checks enabled" />
        <StatCard label="Records Stored" value={`${demoMetrics.totalStorageGB} GB`} subLabel="Encrypted blobs" />
        <StatCard label="Alerts Open" value={demoAlerts.length} subLabel="Last 24h" />
        <StatCard label="Ingestion Rate" value="4.2k/min" subLabel="Avg 5m" />
      </div>

      <SolanaIntegration />

      {mode === 'live' && (
        <SectionCard title="Live API status" subtitle="/status health check">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="text-xs text-[#9AA4B2]">{apiBase ?? 'https://api.echovault.dev (demo)'}</div>
            <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-white">
              {status.loading && 'Checking...'}
              {!status.loading && status.error && `Unavailable (${status.error})`}
              {!status.loading && status.status && `OK ${status.status.version ?? ''}`.trim()}
              {!apiBase && !status.loading && !status.error && !status.status && 'OK demo-0.9.0'}
            </div>
          </div>
        </SectionCard>
      )}

      {mode === 'live' && (
        <SectionCard title="Live grant summary" subtitle="/vault/grants/summary">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="text-xs text-[#9AA4B2]">{apiBase ?? 'https://api.echovault.dev (demo)'}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white">
              {grantSummary.loading && (
                <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Loading…</div>
              )}
              {!grantSummary.loading && grantSummary.error && (
                <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">
                  Unavailable ({grantSummary.error})
                </div>
              )}
              {!grantSummary.loading && grantSummary.summary && (
                <>
                  <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Active: {grantSummary.summary.counts.active}</div>
                  <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Revoked: {grantSummary.summary.counts.revoked}</div>
                  <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Expired: {grantSummary.summary.counts.expired}</div>
                  <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Total: {grantSummary.summary.total}</div>
                </>
              )}
              {!apiBase && !grantSummary.loading && !grantSummary.error && !grantSummary.summary && (
                <>
                  <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Active: 12</div>
                  <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Revoked: 3</div>
                  <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Expired: 2</div>
                  <div className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">Total: 17</div>
                </>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title="Vault usage" subtitle="Encrypted blobs by day">
          <div className="grid grid-cols-7 gap-2">
            {demoMetrics.usageSeries.map((point) => (
              <div key={point.date} className="flex flex-col items-center gap-2">
                <div className="h-20 w-full rounded-lg bg-[#11141c]">
                  <div className="h-full rounded-lg bg-[#3B3FEE]/50" style={{ height: `${(point.value / 900) * 100}%` }} />
                </div>
                <div className="text-[10px] text-[#9AA4B2]">{point.date}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent alerts" subtitle="Triage priority">
          <div className="space-y-3">
            {demoAlerts.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#11141c] p-3 text-xs text-[#9AA4B2]">
                No alerts in the last 24h. Live traffic will appear here.
              </div>
            )}
            {demoAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{alert.title}</span>
                  <StatusPill label={alert.severity} tone={alert.severity as any} />
                </div>
                <div className="mt-2 text-xs text-[#9AA4B2]">{alert.time}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent records" subtitle="Latest context activity">
          <div className="space-y-3">
            {demoRecords.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#11141c] p-3 text-xs text-[#9AA4B2]">
                No recent records yet. New grants populate this stream.
              </div>
            )}
            {demoRecords.map((record) => (
              <div key={record.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{record.scope}</span>
                  <StatusPill label={record.status} tone={record.status === 'active' ? 'success' : 'danger'} />
                </div>
                <div className="mt-2 text-xs text-[#9AA4B2]">{record.owner} · {record.updated}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
