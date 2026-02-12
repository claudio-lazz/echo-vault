import { useMemo, useState } from 'react';
import { SectionCard } from './SectionCard';
import { StatCard } from './StatCard';
import { StatusPill } from './StatusPill';
import { demoUsage } from '../lib/demoData';
import { useDataMode } from '../lib/dataMode';
import { useApiStatus } from '../lib/useApiStatus';
import { useToast } from '../lib/toast';

export function Usage() {
  const { mode } = useDataMode();
  const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;
  const status = useApiStatus(apiBase, mode === 'live');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const toast = useToast();

  const maxTrend = Math.max(...demoUsage.trend.map((item) => item.spend));
  const maxForecast = Math.max(...demoUsage.forecast.map((item) => item.spend));

  const report = useMemo(() => {
    const now = new Date().toISOString();
    const breakdown = demoUsage.breakdown
      .map((row) => `- ${row.label}: $${row.cost}k (${Math.round(row.share * 100)}%)`)
      .join('\n');
    const tenants = demoUsage.topTenants
      .map((tenant) => `- ${tenant.name} (${tenant.scope}) — $${tenant.spend}k, ${tenant.storageTB} TB`)
      .join('\n');
    const optimizations = demoUsage.optimization
      .map((item) => `- ${item.title} [${item.priority}] — ${item.detail}`)
      .join('\n');
    const trend = demoUsage.trend.map((item) => `- ${item.label}: $${item.spend}k`).join('\n');
    const forecast = demoUsage.forecast
      .map((item) => `- ${item.label}: $${item.spend}k (${item.risk})`)
      .join('\n');
    const anomalies = demoUsage.anomalies
      .map((item) => `- ${item.title} · ${item.impact} · ${item.status}`)
      .join('\n');
    const statusLine = mode === 'live'
      ? status.loading
        ? 'API status: checking'
        : status.error
          ? `API status: unavailable (${status.error})`
          : status.status
            ? `API status: ok${status.status.version ? ` (${status.status.version})` : ''}`
            : 'API status: unknown'
      : 'API status: local';

    return `# EchoVault usage snapshot\n\n- Timestamp: ${now}\n- Mode: ${mode}\n- API base: ${apiBase ?? 'https://api.echovault.dev (demo)'}\n- ${statusLine}\n- Monthly burn: $${demoUsage.monthlyBurn}k\n- Edge egress: ${demoUsage.egressTB} TB\n- Retention policy: ${demoUsage.retentionDays} days\n- Active tenants: ${demoUsage.topTenants.length}\n\n## Spend breakdown\n${breakdown}\n\n## Spend trend (last 6 months)\n${trend}\n\n## Forecast (next 3 months)\n${forecast}\n\n## Anomaly watch\n${anomalies}\n\n## Top tenants\n${tenants}\n\n## Optimization queue\n${optimizations}\n\n## Notes\n- `;
  }, [apiBase, mode, status.error, status.loading, status.status?.version]);

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopyState('copied');
      toast.push('Usage report copied.', 'success');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('error');
      toast.push('Copy failed. Try again.', 'error');
      window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'echovault-usage-report.md';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.push('Usage report downloaded.', 'success');
  };

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Burn" value={`$${demoUsage.monthlyBurn}k`} subLabel="Compute + storage" />
        <StatCard label="Edge Egress" value={`${demoUsage.egressTB} TB`} subLabel="Last 30 days" />
        <StatCard label="Retention" value={`${demoUsage.retentionDays} days`} subLabel="Policy default" />
        <StatCard label="Active Tenants" value={demoUsage.topTenants.length} subLabel="Top spenders" />
      </div>

      {mode === 'live' && (
        <div className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-xs text-[#9AA4B2]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Live usage metrics are not available yet. Showing sample data.</span>
            <span>
              {status.loading && 'Checking /status...'}
              {!status.loading && status.error && `API unavailable (${status.error}).`}
              {!status.loading && status.status && `API ok${status.status.version ? ` (${status.status.version})` : ''}.`}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title="Spend breakdown" subtitle="Where the burn lands">
          <div className="space-y-3">
            {demoUsage.breakdown.map((row) => (
              <div key={row.label} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{row.label}</span>
                  <span className="font-semibold">${row.cost}k</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-[#1c2230]">
                  <div className="h-full rounded-full bg-[#3B3FEE]/60" style={{ width: `${row.share * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top tenants" subtitle="Highest spend in 30d">
          <div className="space-y-3">
            {demoUsage.topTenants.map((tenant) => (
              <div key={tenant.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-xs text-[#9AA4B2]">{tenant.scope} · {tenant.region}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${tenant.spend}k</div>
                    <div className="text-xs text-[#9AA4B2]">{tenant.storageTB} TB</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Optimization queue" subtitle="Targets for next week">
          <div className="space-y-3">
            {demoUsage.optimization.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{item.title}</span>
                  <StatusPill label={item.priority} tone={item.priority === 'critical' ? 'danger' : 'warning'} />
                </div>
                <div className="mt-2 text-xs text-[#9AA4B2]">{item.detail}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Spend trend" subtitle="Last 6 months burn">
        <div className="flex flex-wrap items-end gap-3">
          {demoUsage.trend.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 text-xs text-[#9AA4B2]">
              <div className="flex h-24 w-8 items-end rounded-lg bg-[#1c2230]">
                <div
                  className="w-full rounded-lg bg-[#3B3FEE]/70"
                  style={{ height: `${Math.max(8, Math.round((item.spend / maxTrend) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] uppercase tracking-wide">{item.label}</div>
              <div className="text-[10px] text-[#6b7280]">${item.spend}k</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Spend forecast" subtitle="Projected burn next quarter">
          <div className="flex flex-wrap items-end gap-3">
            {demoUsage.forecast.map((item) => {
              const tone = item.risk === 'warning' ? 'warning' : 'success';
              return (
                <div key={item.label} className="flex flex-col items-center gap-2 text-xs text-[#9AA4B2]">
                  <div className="flex h-24 w-10 items-end rounded-lg bg-[#1c2230]">
                    <div
                      className="w-full rounded-lg bg-[#6AE4FF]/70"
                      style={{ height: `${Math.max(8, Math.round((item.spend / maxForecast) * 100))}%` }}
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-wide">{item.label}</div>
                  <div className="text-[10px] text-[#6b7280]">${item.spend}k</div>
                  <StatusPill label={item.risk} tone={tone} />
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Anomaly watch" subtitle="Spend or policy deviations needing attention">
          <div className="space-y-3">
            {demoUsage.anomalies.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white">{item.title}</span>
                  <StatusPill label={item.status} tone={item.status === 'investigating' ? 'warning' : 'info'} />
                </div>
                <div className="mt-2 text-xs text-[#9AA4B2]">{item.detail}</div>
                <div className="mt-2 text-xs text-[#8B95A7]">Impact: {item.impact}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Usage report" subtitle="Copy or download a markdown snapshot for updates">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9AA4B2]">
          <div>Auto-generated summary from the current spend cards.</div>
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
          aria-label="Usage report"
          spellCheck={false}
          className="mt-3 h-44 w-full rounded-lg border border-[#2A3040] bg-[#0b0f17] p-3 text-xs text-[#9AA4B2]"
        />
      </SectionCard>
    </section>
  );
}
