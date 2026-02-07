import { SectionCard } from './SectionCard';

export function Settings() {
  return (
    <section className="space-y-6 px-8 py-6">
      <SectionCard title="Environment" subtitle="Mock or live mode">
        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="font-semibold text-white">Data mode</div>
            <div className="text-xs text-[#9AA4B2]">Defaulting to mock data for demos.</div>
          </div>
          <button className="rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-xs">Mock</button>
        </div>
      </SectionCard>

      <SectionCard title="API base URL" subtitle="Live mode endpoint">
        <div className="text-xs text-[#9AA4B2]">Set VITE_ECHOVAULT_API to enable live calls.</div>
      </SectionCard>

      <SectionCard title="Integrations" subtitle="Upcoming support">
        <div className="text-xs text-[#9AA4B2]">IPFS/S3 adapters, x402 payments, agent SDKs.</div>
      </SectionCard>
    </section>
  );
}
