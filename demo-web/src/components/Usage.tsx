import { SectionCard } from './SectionCard';
import { StatCard } from './StatCard';
import { StatusPill } from './StatusPill';
import { mockUsage } from '../lib/mockData';

export function Usage() {
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
    </section>
  );
}
