import { useMemo, useState } from 'react';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';
import { useDataMode } from '../lib/dataMode';
import { useApiStatus } from '../lib/useApiStatus';
import { useVaultGrants } from '../lib/useVaultGrants';

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;

type Step = {
  id: string;
  title: string;
  description: string;
  hint?: string;
};

const steps: Step[] = [
  {
    id: 'bootstrap',
    title: 'Start EchoVault API',
    description: 'Run the API + demo storage adapters in another terminal.',
    hint: 'npm run demo:api'
  },
  {
    id: 'vault',
    title: 'Initialize a vault',
    description: 'Create a vault + upload encrypted payload for the owner.',
    hint: 'npm run demo:init'
  },
  {
    id: 'grant',
    title: 'Request access grant',
    description: 'Issue a scoped grant for the agent or client.',
    hint: 'npm run demo:grant'
  },
  {
    id: 'fetch',
    title: 'Fetch + decrypt context',
    description: 'Resolve the blob, decrypt locally, and render the preview.',
    hint: 'npm run demo:decrypt'
  },
  {
    id: 'revoke',
    title: 'Revoke + audit',
    description: 'Revoke grants and confirm the audit trail updates.',
    hint: 'npm run demo:revoke'
  }
];

export function DemoFlow() {
  const { mode } = useDataMode();
  const status = useApiStatus(apiBase, mode === 'live');
  const grants = useVaultGrants(apiBase, mode === 'live');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const completionCount = useMemo(
    () => steps.filter((step) => completed[step.id]).length,
    [completed]
  );

  const toggleStep = (id: string) =>
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));

  const reset = () => setCompleted({});
  const markAll = () =>
    setCompleted(() =>
      steps.reduce<Record<string, boolean>>((acc, step) => {
        acc[step.id] = true;
        return acc;
      }, {})
    );

  const buildReport = () => {
    const now = new Date().toISOString();
    const apiLine =
      mode === 'live'
        ? status.loading
          ? 'API status: checking /status'
          : status.error
            ? `API status: unavailable (${status.error})`
            : `API status: OK ${status.status?.version ?? ''}`.trim()
        : 'API status: mock mode';
    const grantsLine =
      mode === 'live'
        ? grants.loading
          ? 'Live grants: loading'
          : grants.error
            ? `Live grants: error (${grants.error})`
            : `Live grants: ${grants.grants.length}`
        : 'Live grants: mock mode';

    const checklist = steps
      .map((step, index) => {
        const done = completed[step.id] ? 'x' : ' ';
        return `- [${done}] ${index + 1}. ${step.title}`;
      })
      .join('\n');

    return `# EchoVault demo run\n\n- Timestamp: ${now}\n- Data mode: ${mode}\n- ${apiLine}\n- ${grantsLine}\n\n## Checklist\n${checklist}\n\n## Notes\n- \n`;
  };

  const report = useMemo(buildReport, [completed, grants.error, grants.grants.length, grants.loading, mode, status.error, status.loading, status.status?.version]);

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'echovault-demo-report.md';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6 px-8 py-6">
      <SectionCard title="Demo readiness" subtitle="Guided flow for the full EchoVault journey">
        <div className="grid gap-4 text-sm lg:grid-cols-3">
          <div className="rounded-lg border border-[#2A3040] bg-[#11141c] p-4">
            <div className="text-xs text-[#9AA4B2]">Data mode</div>
            <div className="mt-1 flex items-center gap-2">
              <StatusPill tone={mode === 'live' ? 'success' : 'info'} label={mode} />
              <span className="text-xs text-[#9AA4B2]">
                {mode === 'live' ? 'Live API enabled' : 'Mock data only'}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-[#2A3040] bg-[#11141c] p-4">
            <div className="text-xs text-[#9AA4B2]">API status</div>
            <div className="mt-1 text-xs text-[#9AA4B2]">
              {mode !== 'live' && 'Switch to live mode to check /status.'}
              {mode === 'live' && status.loading && 'Checking /status...'}
              {mode === 'live' && !status.loading && status.error && `Unavailable (${status.error}).`}
              {mode === 'live' && !status.loading && status.status && `OK ${status.status.version ?? ''}`.trim()}
            </div>
          </div>
          <div className="rounded-lg border border-[#2A3040] bg-[#11141c] p-4">
            <div className="text-xs text-[#9AA4B2]">Live grants</div>
            <div className="mt-1 text-xs text-[#9AA4B2]">
              {mode !== 'live' && 'Enable live mode to pull /vault/grants.'}
              {mode === 'live' && grants.loading && 'Loading grants...'}
              {mode === 'live' && !grants.loading && grants.error && `Error (${grants.error}).`}
              {mode === 'live' && !grants.loading && !grants.error && `${grants.grants.length} active grants`}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Demo flow checklist" subtitle="Mark each step as you walk through the story">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#9AA4B2]">
          <div>
            Completed {completionCount} / {steps.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-[#9AA4B2]"
              onClick={reset}
            >
              Reset
            </button>
            <button
              className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-white"
              onClick={markAll}
            >
              Mark all
            </button>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {steps.map((step, index) => {
            const done = Boolean(completed[step.id]);
            return (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`flex w-full items-start justify-between gap-4 rounded-lg border px-4 py-3 text-left text-sm transition ${
                  done ? 'border-[#2BD4C8] bg-[#142124]' : 'border-[#2A3040] bg-[#11141c]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-xs text-[#9AA4B2]">{index + 1}.</span>
                    <span className="font-semibold">{step.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#9AA4B2]">{step.description}</div>
                  {step.hint && (
                    <div className="mt-2 text-xs text-[#6AE4FF]">{step.hint}</div>
                  )}
                </div>
                <div className="pt-1">
                  <StatusPill tone={done ? 'success' : 'info'} label={done ? 'done' : 'pending'} />
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Demo run notes" subtitle="Copy or download a markdown summary after each run">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9AA4B2]">
          <div>Quick report based on current checklist + live status.</div>
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

      <SectionCard title="Narrative beats" subtitle="Talking points during the walkthrough">
        <div className="grid gap-3 text-xs text-[#9AA4B2] lg:grid-cols-3">
          <div className="rounded-lg border border-[#2A3040] bg-[#11141c] p-3">
            <div className="font-semibold text-white">Owner control</div>
            <div className="mt-1">Context NFTs + Access Grant PDAs keep access auditable and revocable.</div>
          </div>
          <div className="rounded-lg border border-[#2A3040] bg-[#11141c] p-3">
            <div className="font-semibold text-white">Privacy by design</div>
            <div className="mt-1">Encrypted blobs stored off-chain, with scoped grants and expiry.</div>
          </div>
          <div className="rounded-lg border border-[#2A3040] bg-[#11141c] p-3">
            <div className="font-semibold text-white">Operational clarity</div>
            <div className="mt-1">Live status, audit trail, and playbooks keep teams aligned.</div>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}
