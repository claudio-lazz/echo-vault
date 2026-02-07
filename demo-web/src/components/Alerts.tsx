import { mockAlerts } from '../lib/mockData';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

export function Alerts() {
  return (
    <section className="space-y-6 px-8 py-6">
      <SectionCard title="Alerts" subtitle="Security & grant lifecycle">
        <div className="space-y-3 text-sm">
          {mockAlerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{alert.title}</div>
                  <div className="text-xs text-[#9AA4B2]">{alert.id} · {alert.time}</div>
                </div>
                <StatusPill label={alert.severity} tone={alert.severity as any} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}
