import { useMemo, useState } from 'react';
import { mockRecords } from '../lib/mockData';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

const statusOptions = ['all', 'active', 'revoked'] as const;

type StatusFilter = (typeof statusOptions)[number];

export function Records() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return mockRecords.filter((record) => {
      const matchesQuery = lowered
        ? [record.id, record.owner, record.scope].some((field) => field.toLowerCase().includes(lowered))
        : true;
      const matchesStatus = statusFilter === 'all' ? true : record.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const activeCount = mockRecords.filter((record) => record.status === 'active').length;
  const revokedCount = mockRecords.filter((record) => record.status !== 'active').length;

  return (
    <section className="space-y-6 px-8 py-6">
      <SectionCard title="Context records" subtitle="Permissioned blobs by scope">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9AA4B2]">
            <span>Active: <span className="text-white">{activeCount}</span></span>
            <span>Revoked: <span className="text-white">{revokedCount}</span></span>
            <span>Total: <span className="text-white">{mockRecords.length}</span></span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by vault, owner, or scope"
              className="w-60 rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white placeholder:text-[#6E7683]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All statuses' : option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {filtered.map((record) => (
            <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
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
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#0f1219] px-4 py-6 text-center text-xs text-[#9AA4B2]">
              No records match this filter.
            </div>
          )}
        </div>
      </SectionCard>
    </section>
  );
}
