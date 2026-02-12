import { SectionCard } from './SectionCard';
import { useDataMode } from '../lib/dataMode';
import { useApiStatus } from '../lib/useApiStatus';

const apiBase = import.meta.env.VITE_ECHOVAULT_API as string | undefined;

export function Settings() {
  const { mode, setMode } = useDataMode();
  const status = useApiStatus(apiBase, mode === 'live');

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <SectionCard title="Environment" subtitle="Local or live mode">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div>
            <div className="font-semibold text-white">Data mode</div>
            <div className="text-xs text-[#9AA4B2]">Switch between local data and live API calls.</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={mode === 'local'}
              className={`rounded-lg border px-3 py-2 text-xs ${mode === 'local' ? 'border-[#3B3FEE] bg-[#1B1F2E] text-white' : 'border-[#2A3040] bg-[#11141c] text-[#9AA4B2]'}`}
              onClick={() => setMode('local')}
            >
              Local
            </button>
            <button
              type="button"
              aria-pressed={mode === 'live'}
              className={`rounded-lg border px-3 py-2 text-xs ${mode === 'live' ? 'border-[#2BD4C8] bg-[#152026] text-white' : 'border-[#2A3040] bg-[#11141c] text-[#9AA4B2]'}`}
              onClick={() => setMode('live')}
            >
              Live
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="API base URL" subtitle="Live mode endpoint">
        <div className="space-y-2 text-xs text-[#9AA4B2]">
          <div>{apiBase ?? 'https://api.echovault.dev'}</div>
          <div className="text-[11px] text-[#6F7A8A]">
            {apiBase ? 'Override set via VITE_ECHOVAULT_API.' : 'Using default. Set VITE_ECHOVAULT_API to override.'}
          </div>
          {mode === 'live' && (
            <div className="rounded-lg border border-[#2A3040] bg-[#11141c] p-3 text-xs">
              <div className="font-semibold text-white">Live status</div>
              <div className="mt-2 text-[#9AA4B2]">
                {status.loading && 'Checking /status...'}
                {!status.loading && status.error && `Unavailable (${status.error}).`}
                {!status.loading && status.status && `OK ${status.status.version ?? ''}`.trim()}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Integrations" subtitle="Upcoming support">
        <div className="text-xs text-[#9AA4B2]">IPFS/S3 adapters, x402 payments, agent SDKs.</div>
      </SectionCard>
    </section>
  );
}
