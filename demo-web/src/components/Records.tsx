import { useMemo, useState } from 'react';
import { mockRecords } from '../lib/mockData';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

const statusOptions = ['all', 'active', 'revoked'] as const;

type StatusFilter = (typeof statusOptions)[number];
type RecordItem = (typeof mockRecords)[number];

export function Records() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

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
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-2.5 py-1 text-[11px] text-white"
                >
                  View
                </button>
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

      {selectedRecord && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedRecord(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[#1f2430] bg-[#0f1219] px-6 py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#9AA4B2]">Record</div>
                <div className="text-xl font-semibold text-white">{selectedRecord.id}</div>
                <div className="text-xs text-[#9AA4B2]">Owner: {selectedRecord.owner}</div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg border border-[#2A3040] bg-[#11141c] px-2.5 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Scope</div>
                <div className="font-semibold text-white">{selectedRecord.scope}</div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div>
                  <div className="text-xs text-[#9AA4B2]">Status</div>
                  <div className="text-white">{selectedRecord.status}</div>
                </div>
                <StatusPill label={selectedRecord.status} tone={selectedRecord.status === 'active' ? 'success' : 'danger'} />
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Last updated</div>
                <div className="text-white">{selectedRecord.updated}</div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Policy notes</div>
                <div className="text-sm text-white">Encrypted with x402 payment guardrail. Auto-revokes on policy drift.</div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Recent activity</div>
                <ul className="mt-2 space-y-2 text-xs text-[#9AA4B2]">
                  <li>Grant validated · 2m ago</li>
                  <li>Accessed by agent: vault-runner · 6m ago</li>
                  <li>Policy checked · 9m ago</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#0f1219] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Actions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs">Export metadata</button>
                  <button className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs">Rotate keys</button>
                  <button className="rounded-lg border border-[#3d1e24] bg-[#1b1216] px-3 py-2 text-xs text-[#F3B5B5]">Revoke</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
