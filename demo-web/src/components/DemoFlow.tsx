import { useMemo, useState } from 'react';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';
import { useDataMode } from '../lib/dataMode';
import { useApiStatus } from '../lib/useApiStatus';
import { useVaultGrants } from '../lib/useVaultGrants';

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;
const apiRoot = apiBase?.replace(/\/$/, '');
const demoLogsUrl = import.meta.env.VITE_DEMO_LOGS_URL as string | undefined;
const demoOutputUrl = import.meta.env.VITE_DEMO_OUTPUT_URL as string | undefined;
const demoVideoUrl = import.meta.env.VITE_DEMO_VIDEO_URL as string | undefined;

type Step = {
  id: string;
  title: string;
  description: string;
  hint?: string;
};

type LiveSignal = {
  state: 'ready' | 'checking' | 'blocked' | 'pending';
  label: string;
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

const apiActions = apiRoot
  ? [
      {
        id: 'status',
        label: 'Check /status',
        description: 'Confirm API readiness and version metadata.',
        url: `${apiRoot}/status`,
        curl: `curl -s ${apiRoot}/status`
      },
      {
        id: 'grants',
        label: 'List /vault/grants',
        description: 'Review active + revoked grants in live mode.',
        url: `${apiRoot}/vault/grants`,
        curl: `curl -s ${apiRoot}/vault/grants`
      }
    ]
  : [];

const demoAssets = [
  demoLogsUrl
    ? {
        id: 'logs',
        label: 'Demo logs',
        description: 'Raw output from scripts/demo-record.sh or demo runs.',
        url: demoLogsUrl
      }
    : null,
  demoOutputUrl
    ? {
        id: 'output',
        label: 'Demo output',
        description: 'Recording artifacts, screenshots, or exported notes.',
        url: demoOutputUrl
      }
    : null,
  demoVideoUrl
    ? {
        id: 'video',
        label: 'Demo video',
        description: 'Latest recording for sharing and review.',
        url: demoVideoUrl
      }
    : null
].filter(Boolean) as Array<{ id: string; label: string; description: string; url: string }>;

export function DemoFlow() {
  const { mode } = useDataMode();
  const status = useApiStatus(apiBase, mode === 'live');
  const grants = useVaultGrants(apiBase, mode === 'live');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [commandCopy, setCommandCopy] = useState<string | null>(null);

  const liveSignals = useMemo<Record<string, LiveSignal>>(() => {
    if (mode !== 'live') return {} as Record<string, LiveSignal>;

    const apiReady = !status.loading && !status.error && Boolean(status.status);
    const grantsReady = !grants.loading && !grants.error;
    const activeGrants = grants.grants.filter((grant) => !grant.revoked).length;
    const revokedGrants = grants.grants.filter((grant) => grant.revoked).length;

    const apiSignal: LiveSignal = apiReady
      ? { state: 'ready', label: 'API OK' }
      : status.loading
        ? { state: 'checking', label: 'Checking API' }
        : status.error
          ? { state: 'blocked', label: 'API unavailable' }
          : { state: 'pending', label: 'API pending' };

    const grantSignal: LiveSignal = grantsReady
      ? activeGrants > 0
        ? { state: 'ready', label: `${activeGrants} active grants` }
        : { state: 'pending', label: 'No active grants' }
      : grants.loading
        ? { state: 'checking', label: 'Loading grants' }
        : { state: 'blocked', label: grants.error ? `Grants error: ${grants.error}` : 'Grants error' };

    const revokeSignal: LiveSignal = grantsReady
      ? revokedGrants > 0
        ? { state: 'ready', label: `${revokedGrants} revoked grants` }
        : { state: 'pending', label: 'No revocations yet' }
      : grants.loading
        ? { state: 'checking', label: 'Loading revocations' }
        : { state: 'blocked', label: grants.error ? `Grants error: ${grants.error}` : 'Grants error' };

    return {
      bootstrap: apiSignal,
      vault: grantSignal,
      grant: grantSignal,
      fetch: apiReady && activeGrants > 0 ? { state: 'ready', label: 'Payload ready' } : apiSignal,
      revoke: revokeSignal
    };
  }, [grants.error, grants.grants, grants.loading, mode, status.error, status.loading, status.status]);

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

    const commands = steps
      .filter((step) => step.hint)
      .map((step) => `- ${step.title}: ${step.hint}`)
      .join('\n');

    const assets = demoAssets.length
      ? demoAssets.map((asset) => `- ${asset.label}: ${asset.url}`).join('\n')
      : '- (none)';

    return `# EchoVault demo run\n\n- Timestamp: ${now}\n- Data mode: ${mode}\n- ${apiLine}\n- ${grantsLine}\n\n## Checklist\n${checklist}\n\n## Commands\n${commands || '- (none)'}\n\n## Demo assets\n${assets}\n\n## Notes\n- \n`;
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

  const copyCommand = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCommandCopy(id);
      window.setTimeout(() => setCommandCopy(null), 1400);
    } catch {
      setCommandCopy('error');
      window.setTimeout(() => setCommandCopy(null), 1400);
    }
  };

  const allCommands = useMemo(
    () =>
      steps
        .filter((step) => step.hint)
        .map((step) => step.hint)
        .join('\n'),
    []
  );

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
            const liveSignal = liveSignals[step.id];
            const liveTone = liveSignal
              ? liveSignal.state === 'ready'
                ? 'success'
                : liveSignal.state === 'blocked'
                  ? 'danger'
                  : liveSignal.state === 'checking'
                    ? 'info'
                    : 'warning'
              : 'info';
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
                  {mode === 'live' && liveSignal && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#9AA4B2]">
                      <StatusPill tone={liveTone} label={liveSignal.label} />
                      <span>Live signal</span>
                    </div>
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

      <SectionCard title="Demo commands" subtitle="One-click copy for the core demo scripts">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9AA4B2]">
          <div>Use these in order during the live walkthrough.</div>
          <button
            className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-white"
            onClick={() => copyCommand(allCommands, 'all')}
            disabled={!allCommands}
          >
            {commandCopy === 'all' ? 'Copied' : commandCopy === 'error' ? 'Copy failed' : 'Copy all'}
          </button>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {steps.map((step) => (
            <div
              key={`cmd-${step.id}`}
              className="rounded-lg border border-[#2A3040] bg-[#11141c] p-3 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{step.title}</div>
                  <div className="mt-1 text-[#9AA4B2]">{step.description}</div>
                </div>
                <button
                  className="rounded-lg border border-[#2A3040] px-2 py-1 text-[11px] text-[#9AA4B2]"
                  onClick={() => step.hint && copyCommand(step.hint, step.id)}
                  disabled={!step.hint}
                >
                  {commandCopy === step.id ? 'Copied' : commandCopy === 'error' ? 'Copy failed' : 'Copy'}
                </button>
              </div>
              <div className="mt-2 rounded-md border border-[#1c2333] bg-[#0b0f17] px-2 py-1 font-mono text-[11px] text-[#6AE4FF]">
                {step.hint ?? 'No command specified'}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {apiActions.length > 0 && (
        <SectionCard title="Live actions" subtitle="Quick checks for the running demo API">
          <div className="grid gap-3 lg:grid-cols-2">
            {apiActions.map((action) => (
              <div
                key={action.id}
                className="rounded-lg border border-[#2A3040] bg-[#11141c] p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{action.label}</div>
                    <div className="mt-1 text-[#9AA4B2]">{action.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg border border-[#2A3040] px-2 py-1 text-[11px] text-[#9AA4B2]"
                      onClick={() => window.open(action.url, '_blank', 'noopener,noreferrer')}
                    >
                      Open
                    </button>
                    <button
                      className="rounded-lg border border-[#2A3040] px-2 py-1 text-[11px] text-[#9AA4B2]"
                      onClick={() => copyCommand(action.curl, action.id)}
                    >
                      {commandCopy === action.id
                        ? 'Copied'
                        : commandCopy === 'error'
                          ? 'Copy failed'
                          : 'Copy curl'}
                    </button>
                  </div>
                </div>
                <div className="mt-2 rounded-md border border-[#1c2333] bg-[#0b0f17] px-2 py-1 font-mono text-[11px] text-[#6AE4FF]">
                  {action.url}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {demoAssets.length > 0 && (
        <SectionCard title="Demo assets" subtitle="Quick links to recordings and run artifacts">
          <div className="grid gap-3 lg:grid-cols-3">
            {demoAssets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg border border-[#2A3040] bg-[#11141c] p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{asset.label}</div>
                    <div className="mt-1 text-[#9AA4B2]">{asset.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg border border-[#2A3040] px-2 py-1 text-[11px] text-[#9AA4B2]"
                      onClick={() => window.open(asset.url, '_blank', 'noopener,noreferrer')}
                    >
                      Open
                    </button>
                    <button
                      className="rounded-lg border border-[#2A3040] px-2 py-1 text-[11px] text-[#9AA4B2]"
                      onClick={() => copyCommand(asset.url, asset.id)}
                    >
                      {commandCopy === asset.id
                        ? 'Copied'
                        : commandCopy === 'error'
                          ? 'Copy failed'
                          : 'Copy link'}
                    </button>
                  </div>
                </div>
                <div className="mt-2 rounded-md border border-[#1c2333] bg-[#0b0f17] px-2 py-1 font-mono text-[11px] text-[#6AE4FF]">
                  {asset.url}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

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
