import { useMemo, useState } from 'react';
import { demoAlerts } from '../lib/demoData';
import { useDataMode } from '../lib/dataMode';
import { useVaultGrants } from '../lib/useVaultGrants';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

const severityOptions = ['all', 'danger', 'warning', 'info'] as const;

type SeverityFilter = (typeof severityOptions)[number];
type AlertItem = (typeof demoAlerts)[number];

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;

export function Alerts() {
  const { mode } = useDataMode();
  const grantsState = useVaultGrants(apiBase, mode === 'live');
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [drawerNotice, setDrawerNotice] = useState<string | null>(null);

  const liveAlerts = useMemo<AlertItem[]>(() => {
    if (!grantsState.grants.length) return [];
    const now = Date.now() / 1000;
    const alerts: AlertItem[] = [];
    grantsState.grants.forEach((grant, index) => {
      const expired = grant.expires_at ? grant.expires_at < now : false;
      if (grant.revoked || expired) {
        alerts.push({
          id: `AL-REV-${String(index + 1).padStart(3, '0')}`,
          title: `Grant revoked for ${grant.grantee}`,
          severity: 'danger',
          time: 'just now'
        });
      } else if (grant.expires_at && grant.expires_at - now < 24 * 3600) {
        alerts.push({
          id: `AL-EXP-${String(index + 1).padStart(3, '0')}`,
          title: `Grant expiring for ${grant.grantee}`,
          severity: 'warning',
          time: 'within 24h'
        });
      }
    });
    return alerts;
  }, [grantsState.grants]);

  const usingLive = mode === 'live' && !grantsState.error && apiBase;
  const alerts = usingLive && liveAlerts.length ? liveAlerts : demoAlerts;

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return alerts.filter((alert) => {
      const matchesQuery = lowered
        ? [alert.title, alert.id].some((field) => field.toLowerCase().includes(lowered))
        : true;
      const matchesSeverity = severityFilter === 'all' ? true : alert.severity === severityFilter;
      return matchesQuery && matchesSeverity;
    });
  }, [alerts, query, severityFilter]);

  const counts = severityOptions.reduce<Record<string, number>>((acc, option) => {
    if (option !== 'all') {
      acc[option] = alerts.filter((alert) => alert.severity === option).length;
    }
    return acc;
  }, {});

  const buildAlertSummary = (alert: AlertItem) => {
    const now = new Date().toISOString();
    return `# EchoVault alert briefing\n\n- Generated: ${now}\n- Mode: ${usingLive ? 'Live' : 'Local'}\n- Alert ID: ${alert.id}\n- Title: ${alert.title}\n- Severity: ${alert.severity}\n- Time: ${alert.time}\n\n## System context\nPolicy engine detected a delta between scope hash and current on-chain grant.\n\n## Recommended response\n- Notify grant owner and request re-auth.\n- Inspect access trail for repeated anomalies.\n- Rotate vault key if anomaly persists.\n\n## Notes\n- `;
  };

  const copyAlertSummary = async (alert: AlertItem) => {
    try {
      await navigator.clipboard.writeText(buildAlertSummary(alert));
      setDrawerNotice('Alert summary copied');
    } catch {
      setDrawerNotice('Copy failed');
    } finally {
      window.setTimeout(() => setDrawerNotice(null), 1600);
    }
  };

  const downloadAlertSummary = (alert: AlertItem) => {
    const blob = new Blob([buildAlertSummary(alert)], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `echovault-alert-${alert.id.toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <SectionCard title="Alerts" subtitle="Security & grant lifecycle">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9AA4B2]">
            <span>Danger: <span className="text-white">{counts.danger ?? 0}</span></span>
            <span>Warning: <span className="text-white">{counts.warning ?? 0}</span></span>
            <span>Info: <span className="text-white">{counts.info ?? 0}</span></span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search alerts"
              className="w-52 rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white placeholder:text-[#6E7683]"
            />
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as SeverityFilter)}
              className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white"
            >
              {severityOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All severities' : option}
                </option>
              ))}
            </select>
          </div>
        </div>
        {mode === 'live' && (
          <div className="mt-3 rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-[#9AA4B2]">
            {grantsState.loading && 'Loading live alerts...'}
            {!grantsState.loading && grantsState.error && `Live data unavailable (${grantsState.error}). Showing sample alerts.`}
            {!grantsState.loading && !grantsState.error && apiBase && `Live data connected (${alerts.length} alerts).`}
            {!apiBase && 'Set VITE_ECHOVAULT_API to enable live data.'}
          </div>
        )}
        <div className="space-y-3 text-sm">
          {filtered.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{alert.title}</div>
                  <div className="text-xs text-[#9AA4B2]">{alert.id} · {alert.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill label={alert.severity} tone={alert.severity as any} />
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-2.5 py-1 text-[11px] text-white"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#0f1219] px-4 py-4 sm:py-5 lg:py-6 text-center text-xs text-[#9AA4B2]">
              No alerts match this filter.
            </div>
          )}
        </div>
      </SectionCard>

      {selectedAlert && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedAlert(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[#1f2430] bg-[#0f1219] px-6 py-4 sm:py-5 lg:py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#9AA4B2]">Alert</div>
                <div className="text-xl font-semibold text-white">{selectedAlert.title}</div>
                <div className="text-xs text-[#9AA4B2]">{selectedAlert.id} · {selectedAlert.time}</div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg border border-[#2A3040] bg-[#11141c] px-2.5 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div>
                  <div className="text-xs text-[#9AA4B2]">Severity</div>
                  <div className="text-white">{selectedAlert.severity}</div>
                </div>
                <StatusPill label={selectedAlert.severity} tone={selectedAlert.severity as any} />
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">System context</div>
                <div className="text-sm text-white">Policy engine detected a delta between scope hash and current on-chain grant.</div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Recommended response</div>
                <ul className="mt-2 space-y-2 text-xs text-[#9AA4B2]">
                  <li>Notify grant owner and request re-auth.</li>
                  <li>Inspect access trail for repeated anomalies.</li>
                  <li>Rotate vault key if anomaly persists.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#9AA4B2]">Alert report</div>
                  {drawerNotice && <span className="text-[11px] text-[#9AA4B2]">{drawerNotice}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => copyAlertSummary(selectedAlert)}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Copy summary
                  </button>
                  <button
                    onClick={() => downloadAlertSummary(selectedAlert)}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Download markdown
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#0f1219] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Actions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs">Open audit trail</button>
                  <button className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs">Notify owner</button>
                  <button className="rounded-lg border border-[#3d1e24] bg-[#1b1216] px-3 py-2 text-xs text-[#F3B5B5]">Escalate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
