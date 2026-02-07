import { mockAudit } from '../lib/mockData';
import { SectionCard } from './SectionCard';

export function Audit() {
  return (
    <section className="space-y-6 px-8 py-6">
      <SectionCard title="Audit trail" subtitle="Immutable context operations">
        <div className="space-y-3 text-sm">
          {mockAudit.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{entry.action}</div>
                  <div className="text-xs text-[#9AA4B2]">{entry.actor} · {entry.detail}</div>
                </div>
                <div className="text-xs text-[#9AA4B2]">{entry.time}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}
