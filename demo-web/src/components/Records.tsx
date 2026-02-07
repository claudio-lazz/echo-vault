import { mockRecords } from '../lib/mockData';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

export function Records() {
  return (
    <section className="space-y-6 px-8 py-6">
      <SectionCard title="Context records" subtitle="Permissioned blobs by scope">
        <div className="space-y-3 text-sm">
          {mockRecords.map((record) => (
            <div key={record.id} className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
              <div>
                <div className="font-semibold text-white">{record.id}</div>
                <div className="text-xs text-[#9AA4B2]">{record.owner} · {record.scope}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-[#9AA4B2]">{record.updated}</div>
                <StatusPill label={record.status} tone={record.status === 'active' ? 'success' : 'danger'} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}
