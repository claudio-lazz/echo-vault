import { mockVaults } from '../lib/mockData';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

export function Vaults() {
  return (
    <section className="space-y-6 px-8 py-6">
      <SectionCard title="Vault inventory" subtitle="Active vaults across regions">
        <div className="space-y-3 text-sm">
          {mockVaults.map((vault) => (
            <div key={vault.id} className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
              <div>
                <div className="font-semibold text-white">{vault.id}</div>
                <div className="text-xs text-[#9AA4B2]">{vault.owner} · {vault.region}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-[#9AA4B2]">{vault.storageGB} GB</div>
                <StatusPill label={vault.status} tone={vault.status === 'healthy' ? 'success' : 'warning'} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}
