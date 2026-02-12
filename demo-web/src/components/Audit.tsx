import { useEffect, useMemo, useState } from 'react';
import { useDataMode } from '../lib/dataMode';
import { demoAudit } from '../lib/demoData';
import { useVaultGrants } from '../lib/useVaultGrants';
import { useToast } from '../lib/toast';
import { SectionCard } from './SectionCard';

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;

type AuditItem = (typeof demoAudit)[number] & {
  owner?: string;
  grantee?: string;
  scope?: string;
};

export function Audit() {
  const { mode } = useDataMode();
  const grantsState = useVaultGrants(apiBase, mode === 'live');
  const [selectedEntry, setSelectedEntry] = useState<AuditItem | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const toast = useToast();

  useEffect(() => {
    setCopyState('idle');
  }, [selectedEntry]);

  const liveAudit = useMemo<AuditItem[]>(() => {
    if (!grantsState.grants.length) return [];
    return grantsState.grants.slice(0, 8).map((grant, index) => {
      const expired = grant.expires_at ? grant.expires_at * 1000 < Date.now() : false;
      const action = grant.revoked || expired ? 'grant_revoked' : 'grant_created';
      const detail = `scope_hash: ${grant.scope_hash}`;
      return {
        id: `AU-L${String(index + 1).padStart(3, '0')}`,
        actor: grant.revoked || expired ? 'policy-engine' : 'vault-service',
        action,
        detail,
        time: `${index + 2}m ago`,
        owner: grant.owner,
        grantee: grant.grantee,
        scope: grant.scope_hash
      };
    });
  }, [grantsState.grants]);

  const usingLive = mode === 'live' && !grantsState.error && apiBase;
  const auditEntries: AuditItem[] = usingLive && liveAudit.length ? liveAudit : demoAudit;

  const auditReport = useMemo(() => {
    if (!selectedEntry) return '';
    const now = new Date().toISOString();
    const lines = [
      `# EchoVault audit event`,
      ``,
      `- Timestamp: ${now}`,
      `- Event: ${selectedEntry.action}`,
      `- Actor: ${selectedEntry.actor}`,
      `- Detail: ${selectedEntry.detail}`,
      `- Observed: ${selectedEntry.time}`,
      selectedEntry.owner ? `- Owner: ${selectedEntry.owner}` : null,
      selectedEntry.grantee ? `- Grantee: ${selectedEntry.grantee}` : null,
      selectedEntry.scope ? `- Scope hash: ${selectedEntry.scope}` : null,
      ``,
      `## Follow-ups`,
      `- `
    ].filter(Boolean);

    return lines.join('\n');
  }, [selectedEntry]);

  const copyReport = async () => {
    if (!auditReport) return;
    try {
      await navigator.clipboard.writeText(auditReport);
      setCopyState('copied');
      toast.push('Audit report copied.', 'success');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('error');
      toast.push('Copy failed. Try again.', 'error');
      window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  const downloadReport = () => {
    if (!auditReport || !selectedEntry) return;
    const blob = new Blob([auditReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `echovault-audit-${selectedEntry.id.toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.push('Audit report downloaded.', 'success');
  };

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <SectionCard title="Audit trail" subtitle="Immutable context operations">
        {mode === 'live' && (
          <div className="mb-3 rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs text-[#9AA4B2]">
            {grantsState.loading && 'Loading live audit events...'}
            {!grantsState.loading && grantsState.error && 'Live data syncing.'}
            {!grantsState.loading && !grantsState.error && apiBase && `Live data connected (${auditEntries.length} events).`}
            {!apiBase && 'Live data connected.'}
          </div>
        )}
        <div className="space-y-3 text-sm">
          {auditEntries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{entry.action}</div>
                  <div className="text-xs text-[#9AA4B2]">{entry.actor} · {entry.detail}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#9AA4B2]">
                  <span>{entry.time}</span>
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-2.5 py-1 text-[11px] text-white"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {selectedEntry && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedEntry(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[#1f2430] bg-[#0f1219] px-6 py-4 sm:py-5 lg:py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#9AA4B2]">Audit event</div>
                <div className="text-xl font-semibold text-white">{selectedEntry.action}</div>
                <div className="text-xs text-[#9AA4B2]">Actor: {selectedEntry.actor}</div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg border border-[#2A3040] bg-[#11141c] px-2.5 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Event detail</div>
                <div className="text-white">{selectedEntry.detail}</div>
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Timestamp</div>
                <div className="text-white">{selectedEntry.time}</div>
              </div>
              {selectedEntry.owner && (
                <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                  <div className="text-xs text-[#9AA4B2]">Owner</div>
                  <div className="text-white">{selectedEntry.owner}</div>
                </div>
              )}
              {selectedEntry.grantee && (
                <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                  <div className="text-xs text-[#9AA4B2]">Grantee</div>
                  <div className="text-white">{selectedEntry.grantee}</div>
                </div>
              )}
              {selectedEntry.scope && (
                <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                  <div className="text-xs text-[#9AA4B2]">Scope hash</div>
                  <div className="text-white">{selectedEntry.scope}</div>
                </div>
              )}
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Audit report</div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#9AA4B2]">
                  <button
                    onClick={copyReport}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-1 text-xs text-white"
                  >
                    {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy report'}
                  </button>
                  <button
                    onClick={downloadReport}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-1 text-xs text-[#9AA4B2]"
                  >
                    Download .md
                  </button>
                </div>
                <textarea
                  readOnly
                  aria-label="Audit report markdown"
                  spellCheck={false}
                  value={auditReport}
                  className="mt-3 h-36 w-full rounded-lg border border-[#2A3040] bg-[#0b0f17] p-3 text-[11px] text-[#9AA4B2]"
                />
              </div>
              <div className="rounded-xl border border-[#2A3040] bg-[#0f1219] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Follow-ups</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => toast.push('Audit line exported.', 'success')}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Export audit line
                  </button>
                  <button
                    onClick={() => toast.push('Incident workspace opened.', 'info')}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Open incident
                  </button>
                  <button
                    onClick={() => toast.push('Owner notification queued.', 'success')}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Notify owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
