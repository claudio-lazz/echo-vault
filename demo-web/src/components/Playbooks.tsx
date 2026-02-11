import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';
import { demoPlaybookRuns, demoPlaybooks } from '../lib/demoData';

type PlaybookItem = (typeof demoPlaybooks)[number];

type PlaybookRun = {
  id: string;
  status: 'success' | 'warning' | 'failed';
  time: string;
  detail: string;
};

type PlaybookRunSummary = {
  successRate: number;
  avgRuntime: string;
  lastOutcome: 'success' | 'warning' | 'failed';
  lastRunDuration: string;
  recent: PlaybookRun[];
};

export function Playbooks() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookItem | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    setCopyState('idle');
  }, [selectedPlaybook]);

  const detail = useMemo<PlaybookRunSummary | null>(() => {
    if (!selectedPlaybook) return null;
    const detailMap = demoPlaybookRuns as Record<string, PlaybookRunSummary>;
    return (
      detailMap[selectedPlaybook.id] ?? {
        successRate: 0.9,
        avgRuntime: '1m 05s',
        lastOutcome: selectedPlaybook.status === 'warning' ? 'warning' : 'success',
        lastRunDuration: '1m 12s',
        recent: [
          { id: 'RUN-0001', status: 'success', time: selectedPlaybook.lastRun, detail: 'Run completed.' }
        ]
      }
    );
  }, [selectedPlaybook]);

  const report = useMemo(() => {
    if (!selectedPlaybook || !detail) return '';
    const now = new Date().toISOString();
    const steps = selectedPlaybook.steps.map((step) => `- ${step}`).join('\n');
    const runs = detail.recent
      .map((run) => `- ${run.id} · ${run.status} · ${run.time} — ${run.detail}`)
      .join('\n');
    return `# EchoVault playbook report\n\n- Timestamp: ${now}\n- Playbook: ${selectedPlaybook.name} (${selectedPlaybook.id})\n- Trigger: ${selectedPlaybook.trigger}\n- Owner: ${selectedPlaybook.owner}\n- Status: ${selectedPlaybook.status}\n- Last run: ${selectedPlaybook.lastRun}\n- Last outcome: ${detail.lastOutcome}\n- Last duration: ${detail.lastRunDuration}\n- Success rate: ${Math.round(detail.successRate * 100)}%\n- Avg runtime: ${detail.avgRuntime}\n\n## Steps\n${steps}\n\n## Recent runs\n${runs}\n\n## Notes\n- `;
  }, [detail, selectedPlaybook]);

  const copyReport = async () => {
    if (!report) return;
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
    if (!report || !selectedPlaybook) return;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `echovault-playbook-${selectedPlaybook.id.toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SectionCard title="Automation coverage" subtitle="% of alerts with a playbook">
          <div className="text-3xl font-semibold">82%</div>
          <div className="mt-2 text-xs text-[#9AA4B2]">+6% week over week</div>
        </SectionCard>
        <SectionCard title="Median time to contain" subtitle="Last 24 hours">
          <div className="text-3xl font-semibold">7m 14s</div>
          <div className="mt-2 text-xs text-[#9AA4B2]">-1m 20s vs prior day</div>
        </SectionCard>
        <SectionCard title="Playbooks enabled" subtitle="Active automation">
          <div className="text-3xl font-semibold">14 / 17</div>
          <div className="mt-2 text-xs text-[#9AA4B2]">3 require review</div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title="Active playbooks" subtitle="Incident response automation">
          <div className="space-y-3">
            {demoPlaybooks.map((playbook) => (
              <div key={playbook.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{playbook.name}</div>
                    <div className="text-xs text-[#9AA4B2]">Trigger: {playbook.trigger}</div>
                  </div>
                  <StatusPill label={playbook.status} tone={playbook.status === 'healthy' ? 'success' : 'warning'} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#9AA4B2]">
                  <div>Owner: {playbook.owner}</div>
                  <div>Last run: {playbook.lastRun}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#9AA4B2]">
                  {playbook.steps.map((step) => (
                    <span key={step} className="rounded-full border border-[#2A3040] px-2 py-1">
                      {step}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setSelectedPlaybook(playbook)}
                    className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-1 text-xs text-white"
                  >
                    View run history
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Review queue" subtitle="Requires policy sign-off">
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-[#2A3040] bg-[#11141c] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Grant anomaly containment</div>
                  <div className="text-xs text-[#9AA4B2]">Adds auto-revoke for burst risk.</div>
                </div>
                <StatusPill label="Pending" tone="warning" />
              </div>
              <div className="mt-3 text-xs text-[#9AA4B2]">Awaiting: Security review · ETA 2h</div>
            </div>
            <div className="rounded-xl border border-[#2A3040] bg-[#11141c] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Vault region failover</div>
                  <div className="text-xs text-[#9AA4B2]">Adds EU-West to quorum.</div>
                </div>
                <StatusPill label="Queued" tone="warning" />
              </div>
              <div className="mt-3 text-xs text-[#9AA4B2]">Awaiting: Ops approval · ETA 6h</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Next actions" subtitle="Operator handoff">
          <div className="space-y-3 text-sm">
            {[
              'Verify audit log export includes grant revocations',
              'Update pager routing for high-sev grant spikes',
              'Tune anomaly threshold for cold-start vaults',
              'Ship dry-run results to oncall channel'
            ].map((item) => (
              <div key={item} className="rounded-lg border border-[#2A3040] bg-[#11141c] p-3 text-xs text-[#9AA4B2]">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {selectedPlaybook && detail && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-xl overflow-y-auto border-l border-[#1f2430] bg-[#0b0f17] px-6 py-4 sm:py-5 lg:py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#9AA4B2]">Playbook detail</div>
                <div className="text-lg font-semibold text-white">{selectedPlaybook.name}</div>
              </div>
              <button
                onClick={() => setSelectedPlaybook(null)}
                className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-[#9AA4B2]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm text-[#9AA4B2]">
              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Trigger: {selectedPlaybook.trigger}</span>
                  <StatusPill label={selectedPlaybook.status} tone={selectedPlaybook.status === 'healthy' ? 'success' : 'warning'} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>Owner: {selectedPlaybook.owner}</div>
                  <div>Last run: {selectedPlaybook.lastRun}</div>
                  <div>Success rate: {Math.round(detail.successRate * 100)}%</div>
                  <div>Avg runtime: {detail.avgRuntime}</div>
                </div>
              </div>

              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Last run outcome</div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusPill label={detail.lastOutcome} tone={detail.lastOutcome === 'success' ? 'success' : 'warning'} />
                  <span className="text-xs text-[#9AA4B2]">Duration: {detail.lastRunDuration}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPlaybook.steps.map((step) => (
                    <span key={step} className="rounded-full border border-[#2A3040] px-2 py-1 text-[11px]">
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="text-xs text-[#9AA4B2]">Recent runs</div>
                <div className="mt-3 space-y-2 text-xs">
                  {detail.recent.map((run) => (
                    <div key={run.id} className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{run.id}</span>
                        <StatusPill label={run.status} tone={run.status === 'success' ? 'success' : 'warning'} />
                      </div>
                      <div className="mt-1 text-[11px] text-[#9AA4B2]">{run.time}</div>
                      <div className="mt-2 text-[11px] text-[#8B95A7]">{run.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#9AA4B2]">Playbook report</div>
                  {copyState !== 'idle' && (
                    <span className="text-[11px] text-[#9AA4B2]">
                      {copyState === 'copied' ? 'Copied' : 'Copy failed'}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={copyReport}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Copy report
                  </button>
                  <button
                    onClick={downloadReport}
                    className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs"
                  >
                    Download markdown
                  </button>
                </div>
                <textarea
                  readOnly
                  value={report}
                  aria-label="Playbook report"
                  spellCheck={false}
                  className="mt-3 h-40 w-full rounded-lg border border-[#2A3040] bg-[#0b0f17] p-3 text-xs text-[#9AA4B2]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
