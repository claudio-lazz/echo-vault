import { useEffect, useMemo, useState } from 'react';
import { demoRecordDetails, demoRecords } from '../lib/demoData';
import { useDataMode } from '../lib/dataMode';
import { useVaultGrants } from '../lib/useVaultGrants';
import { useToast } from '../lib/toast';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

const statusOptions = ['all', 'active', 'revoked'] as const;
const sortOptions = [
  { value: 'default', label: 'Default order' },
  { value: 'owner', label: 'Owner (A → Z)' },
  { value: 'scope', label: 'Scope (A → Z)' },
  { value: 'status', label: 'Status (active first)' },
  { value: 'id', label: 'Record ID (A → Z)' }
] as const;

type StatusFilter = (typeof statusOptions)[number];
type SortKey = (typeof sortOptions)[number]['value'];
type RecordItem = (typeof demoRecords)[number] & { grantee?: string };

type RecordDetail = {
  policyNote: string;
  activity: string[];
};

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;

export function Records() {
  const { mode } = useDataMode();
  const grantsState = useVaultGrants(apiBase, mode === 'live');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const toast = useToast();
  const handleResetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setSortKey('default');
  };

  const filtersActive = query.trim().length > 0 || statusFilter !== 'all' || sortKey !== 'default';

  useEffect(() => {
    setCopyStatus(null);
  }, [selectedRecord]);

  const liveRecords = useMemo<RecordItem[]>(() => {
    if (!grantsState.grants.length) return [];
    return grantsState.grants.map((grant, index) => {
      const expired = grant.expires_at ? grant.expires_at * 1000 < Date.now() : false;
      const status = grant.status ?? (grant.revoked || expired ? 'revoked' : 'active');
      const updated = grant.expires_at ? `expires ${new Date(grant.expires_at * 1000).toLocaleDateString()}` : 'live';
      return {
        id: `GR-${String(index + 1).padStart(3, '0')}`,
        owner: grant.owner,
        grantee: grant.grantee,
        scope: grant.scope_hash,
        status,
        updated
      };
    });
  }, [grantsState.grants]);

  const usingLive = mode === 'live' && !grantsState.error && apiBase;
  const records: RecordItem[] = usingLive && liveRecords.length ? liveRecords : (demoRecords as RecordItem[]);
  const showLiveEmpty = usingLive && !grantsState.loading && !grantsState.error && liveRecords.length === 0;

  const selectedDetail = useMemo<RecordDetail | null>(() => {
    if (!selectedRecord) return null;
    const detailMap = demoRecordDetails as Record<string, RecordDetail>;
    return (
      detailMap[selectedRecord.id] ?? {
        policyNote: usingLive
          ? 'Live grants are synced from the API. Policy notes will appear once attestation metadata is available.'
          : 'Policy notes unavailable for this record.',
        activity: [
          `Grant status synced · ${selectedRecord.updated}`,
          'Audit trail entry created · just now',
          'Policy attestation pending'
        ]
      }
    );
  }, [selectedRecord, usingLive]);

  const handleCopy = async (label: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copied`);
      toast.push(`${label} copied.`, 'success');
    } catch (error) {
      console.error(error);
      setCopyStatus('Copy unavailable');
      toast.push('Copy unavailable.', 'error');
    } finally {
      window.setTimeout(() => setCopyStatus(null), 1800);
    }
  };

  const handleDownloadMetadata = (record: RecordItem) => {
    const payload = {
      generated_at: new Date().toISOString(),
      record
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echovault-record-${record.id.toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.push('Record metadata downloaded.', 'success');
  };

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery = lowered
        ? [record.id, record.owner, record.scope, record.grantee || ''].some((field) => field.toLowerCase().includes(lowered))
        : true;
      const matchesStatus = statusFilter === 'all' ? true : record.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, records, statusFilter]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    switch (sortKey) {
      case 'owner':
        return data.sort((a, b) => a.owner.localeCompare(b.owner));
      case 'scope':
        return data.sort((a, b) => a.scope.localeCompare(b.scope));
      case 'status':
        return data.sort((a, b) => a.status.localeCompare(b.status));
      case 'id':
        return data.sort((a, b) => a.id.localeCompare(b.id));
      default:
        return data;
    }
  }, [filtered, sortKey]);

  const handleExport = () => {
    if (!sorted.length) {
      toast.push('No records to export yet.', 'error');
      return;
    }
    const payload = {
      generated_at: new Date().toISOString(),
      total: sorted.length,
      records: sorted
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echovault-records-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.push('Records exported.', 'success');
  };

  const activeCount = records.filter((record) => record.status === 'active').length;
  const revokedCount = records.filter((record) => record.status !== 'active').length;

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <SectionCard title="Context records" subtitle="Permissioned blobs by scope">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9AA4B2]">
            <span>Active: <span className="text-white">{activeCount}</span></span>
            <span>Revoked: <span className="text-white">{revokedCount}</span></span>
            <span>Total: <span className="text-white">{records.length}</span></span>
            <span>Results: <span className="text-white">{filtered.length}</span> (filtered)</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by record, owner, grantee, or scope"
              aria-label="Search records"
              className="w-60 rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white placeholder:text-[#6E7683]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              aria-label="Filter by status"
              className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All statuses' : option}
                </option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              aria-label="Sort records"
              className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {filtersActive && (
              <button type="button"
                onClick={handleResetFilters}
                className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-[#C8D0DD]"
              >
                Reset filters
              </button>
            )}
            <button type="button"
              onClick={handleExport}
              disabled={sorted.length === 0}
              className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Export JSON
            </button>
          </div>
        </div>
        {mode === 'live' && (
          <div
            className="mt-3 rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-[#9AA4B2]"
            role="status"
            aria-live="polite"
          >
            {grantsState.loading && 'Loading live grants...'}
            {!grantsState.loading && grantsState.error && 'Live data unavailable; showing demo data.'}
            {!grantsState.loading && !grantsState.error && apiBase && (liveRecords.length
              ? `Live data connected (${liveRecords.length} grants).`
              : 'Live data connected (0 grants).')}
            {!apiBase && 'Live data connected.'}
          </div>
        )}
        <div className="space-y-3 text-sm">
          {showLiveEmpty && (
            <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#0f1219] px-4 py-3 text-xs text-[#9AA4B2]">
              Live is connected but returned zero grants. Records will appear as data streams in.
            </div>
          )}
          {sorted.map((record) => (
            <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
              <div>
                <div className="font-semibold text-white">{record.id}</div>
                <div className="text-xs text-[#9AA4B2]">{record.owner} · {record.scope}</div>
                {record.grantee && (
                  <div className="text-xs text-[#6E7683]">Grantee: {record.grantee}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-[#9AA4B2]">{record.updated}</div>
                <StatusPill label={record.status} tone={record.status === 'active' ? 'success' : 'danger'} />
                <button type="button"
                  onClick={() => setSelectedRecord(record)}
                  className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-2.5 py-1 text-[11px] text-white"
                >
                  View
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#0f1219] px-4 py-4 sm:py-5 lg:py-6 text-center text-xs text-[#9AA4B2]">
              <div>No records match this filter.</div>
              <button type="button"
                onClick={handleResetFilters}
                className="mt-3 rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-[11px] text-white"
              >
                Reset filters
              </button>
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
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[#1f2430] bg-[#0f1219] px-6 py-4 sm:py-5 lg:py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#9AA4B2]">Record</div>
                <div className="text-xl font-semibold text-white">{selectedRecord.id}</div>
                <div className="text-xs text-[#9AA4B2]">Owner: {selectedRecord.owner}</div>
                {selectedRecord.grantee && (
                  <div className="text-xs text-[#9AA4B2]">Grantee: {selectedRecord.grantee}</div>
                )}
              </div>
              <button type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg border border-[#2A3040] bg-[#11141c] px-2.5 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              {copyStatus && (
                <div
                  className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-[#9AA4B2]"
                  role="status"
                  aria-live="polite"
                >
                  {copyStatus}
                </div>
              )}
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Metadata</div>
                <div className="mt-3 space-y-2 text-xs text-[#9AA4B2]">
                  <div className="flex items-center justify-between">
                    <span>Owner</span>
                    <span className="text-white">{selectedRecord.owner}</span>
                  </div>
                  {selectedRecord.grantee && (
                    <div className="flex items-center justify-between">
                      <span>Grantee</span>
                      <span className="text-white">{selectedRecord.grantee}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Scope</span>
                    <span className="text-white">{selectedRecord.scope}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <StatusPill label={selectedRecord.status} tone={selectedRecord.status === 'active' ? 'success' : 'danger'} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last updated</span>
                    <span className="text-white">{selectedRecord.updated}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#0f1219] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Quick actions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button"
                    onClick={() => handleCopy('Owner', selectedRecord.owner)}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Copy owner
                  </button>
                  <button type="button"
                    onClick={() => handleCopy('Scope', selectedRecord.scope)}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Copy scope
                  </button>
                  <button type="button"
                    onClick={() => handleDownloadMetadata(selectedRecord)}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Download metadata
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Policy notes</div>
                <div className="text-sm text-white">{selectedDetail?.policyNote}</div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Recent activity</div>
                <ul className="mt-2 space-y-2 text-xs text-[#9AA4B2]">
                  {selectedDetail?.activity.length ? (
                    selectedDetail.activity.map((item) => (
                      <li key={item}>{item}</li>
                    ))
                  ) : (
                    <li className="text-[#6E7683]">No activity yet.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#0f1219] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Governance</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs">Rotate keys</button>
                  <button type="button" className="rounded-lg border border-[#3d1e24] bg-[#1b1216] px-3 py-2 text-xs text-[#F3B5B5]">Revoke</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
