import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';
import { mockPlaybooks } from '../lib/mockData';

export function Playbooks() {
  return (
    <section className="space-y-6 px-8 py-6">
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
            {mockPlaybooks.map((playbook) => (
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
    </section>
  );
}
