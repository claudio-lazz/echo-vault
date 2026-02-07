import { useMemo, useState } from 'react';
import { SectionCard } from './SectionCard';
import { StatCard } from './StatCard';
import { StatusPill } from './StatusPill';
import { mockUsage } from '../lib/mockData';

export function Usage() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const report = useMemo(() => {
    const now = new Date().toISOString();
    const breakdown = mockUsage.breakdown
      .map((row) => `- ${row.label}: $${row.cost}k (${Math.round(row.share * 100)}%)`)
      .join('\n');
    const tenants = mockUsage.topTenants
      .map((tenant) => `- ${tenant.name} (${tenant.scope}) — $${tenant.spend}k, ${tenant.storageTB} TB`)
      .join('\n');
    const optimizations = mockUsage.optimization
      .map((item) => `- ${item.title} [${item.priority}] — ${item.detail}`)
      .join('\n');

    return `# EchoVault usage snapshot\n\n- Timestamp: ${now}\n- Monthly burn: $${mockUsage.monthlyBurn}k\n- Edge egress: ${mockUsage.egressTB} TB\n- Retention policy: ${mockUsage.retentionDays} days\n- Active tenants: ${mockUsage.topTenants.length}\n\n## Spend breakdown\n${breakdown}\n\n## Top tenants\n${tenants}\n\n## Optimization queue\n${optimizations}\n\n## Notes\n- `;
  }, []);

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

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'echovault-usage-report.md';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6 px-8 py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Burn" value={`$${mockUsage.monthlyBurn}k`} subLabel="Compute + storage" />
        <StatCard label="Edge Egress" value={`${mockUsage.egressTB} TB`} subLabel="Last 30 days" />
        <StatCard label="Retention" value={`${mockUsage.retentionDays} days`} subLabel="Policy default" />
        <StatCard label="Active Tenants" value={mockUsage.topTenants.length} subLabel="Top spenders" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title="Spend breakdown" subtitle="Where the burn lands">
          <div className="space-y-3">
            {mockUsage.breakdown.map((row) => (
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
            {mockUsage.topTenants.map((tenant) => (
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
            {mockUsage.optimization.map((item) => (
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
          className="mt-3 h-44 w-full rounded-lg border border-[#2A3040] bg-[#0b0f17] p-3 text-xs text-[#9AA4B2]"
        />
      </SectionCard>
    </section>
  );
}
