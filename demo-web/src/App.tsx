import './index.css'

const navItems = [
  { label: 'Overview', id: 'overview' },
  { label: 'Vaults', id: 'vaults' },
  { label: 'Records', id: 'records' },
  { label: 'Alerts', id: 'alerts' },
  { label: 'Audit', id: 'audit' },
  { label: 'Settings', id: 'settings' }
]

const kpis = [
  { label: 'Vault Health', value: '99.98%' },
  { label: 'Records Stored', value: '1.24M' },
  { label: 'Alerts Open', value: '2' },
  { label: 'Ingestion Rate', value: '4.2k/min' }
]

const grants = [
  {
    subject: 'alpha-agent',
    scope: 'vault:product-design',
    expires: '4h 12m',
    status: 'Active'
  },
  {
    subject: 'pilot-researcher',
    scope: 'vault:market-intel',
    expires: '11h 04m',
    status: 'Expiring'
  },
  {
    subject: 'sync-bot',
    scope: 'vault:ops',
    expires: '—',
    status: 'Revoked'
  }
]

const policies = [
  {
    title: 'PII redaction before export',
    detail: 'Strip user identifiers from outbound summaries.'
  },
  {
    title: 'Consent gate for cross-org reads',
    detail: 'Require on-chain signature for every external request.'
  },
  {
    title: 'Anomaly quarantine',
    detail: 'Freeze grants on 3+ failed decrypt attempts.'
  }
]

const auditEvents = [
  {
    action: 'Grant issued to alpha-agent',
    detail: 'Scope: vault:product-design',
    time: '2m ago'
  },
  {
    action: 'Encrypted bundle sealed',
    detail: 'Vault: market-intel',
    time: '9m ago'
  },
  {
    action: 'Revocation recorded',
    detail: 'Sync-bot removed from ops vault',
    time: '21m ago'
  }
]

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  Expiring: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  Revoked: 'bg-rose-500/20 text-rose-200 border-rose-500/30'
}

function App() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#f4f6fa]">
      <div className="flex h-screen">
        <aside className="w-64 border-r border-[#2A3040] bg-[#171B24] p-6">
          <div className="text-xl font-semibold tracking-tight">EchoVault</div>
          <div className="mt-8 space-y-2 text-sm">
            {navItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg px-3 py-2 ${item.id === 'overview' ? 'bg-[#1f2430] text-white' : 'text-[#9AA4B2]'}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <header className="flex items-center justify-between border-b border-[#2A3040] bg-[#0f1117] px-8 py-6">
            <div>
              <div className="text-2xl font-semibold">Overview</div>
              <div className="text-sm text-[#9AA4B2]">Secure, permissioned context layer for AI agents</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-[#2A3040] bg-[#171B24] px-4 py-2 text-xs text-[#9AA4B2]">
                Mock Mode
              </div>
              <div className="h-9 w-9 rounded-full bg-[#2BD4C8]" />
            </div>
          </header>

          <section className="space-y-6 px-8 py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-4">
                  <div className="text-xs uppercase tracking-wide text-[#9AA4B2]">{kpi.label}</div>
                  <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                <div className="text-sm text-[#9AA4B2]">Vault usage</div>
                <div className="mt-6 h-40 rounded-xl border border-dashed border-[#2A3040]" />
              </div>
              <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                <div className="text-sm text-[#9AA4B2]">Recent alerts</div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-sm">
                    Unusual access pattern detected
                  </div>
                  <div className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3 text-sm">
                    Grant expiring in 12 hours
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#9AA4B2]">Recent records</div>
                  <button className="rounded-lg bg-[#3B3FEE] px-4 py-2 text-xs font-semibold">Create vault</button>
                </div>
                <div className="mt-4 space-y-2 text-sm text-[#9AA4B2]">
                  <div className="flex justify-between rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">
                    <span>Context grant • alpha-user</span>
                    <span>2m ago</span>
                  </div>
                  <div className="flex justify-between rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2">
                    <span>Vault init • gpt-agent</span>
                    <span>8m ago</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                <div className="text-sm text-[#9AA4B2]">Quick actions</div>
                <div className="mt-4 space-y-2 text-sm">
                  <button className="w-full rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-left">Encrypt payload</button>
                  <button className="w-full rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-left">Grant access</button>
                  <button className="w-full rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-left">Request context</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#9AA4B2]">Access grants</div>
                    <div className="text-xs text-[#6B7280]">Live permissions with expiry tracking</div>
                  </div>
                  <button className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-[#9AA4B2]">
                    Export
                  </button>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {grants.map((grant) => (
                    <div
                      key={grant.subject}
                      className="flex flex-col gap-2 rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#f4f6fa]">{grant.subject}</div>
                        <div className="text-xs text-[#9AA4B2]">{grant.scope}</div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#9AA4B2]">
                        <span>Expires {grant.expires}</span>
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] ${statusStyles[grant.status]}`}
                        >
                          {grant.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                <div className="text-sm text-[#9AA4B2]">Policy guardrails</div>
                <div className="mt-4 space-y-3">
                  {policies.map((policy) => (
                    <div key={policy.title} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-3">
                      <div className="text-sm font-semibold text-[#f4f6fa]">{policy.title}</div>
                      <div className="mt-1 text-xs text-[#9AA4B2]">{policy.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                <div className="text-sm text-[#9AA4B2]">Audit trail</div>
                <div className="mt-4 space-y-3">
                  {auditEvents.map((event) => (
                    <div key={event.action} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-[#3B3FEE]" />
                      <div className="flex-1 rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2 text-sm">
                        <div className="font-semibold text-[#f4f6fa]">{event.action}</div>
                        <div className="text-xs text-[#9AA4B2]">{event.detail}</div>
                      </div>
                      <div className="text-xs text-[#9AA4B2]">{event.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                <div className="text-sm text-[#9AA4B2]">Pipeline health</div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                    <span>Decrypt latency</span>
                    <span className="text-[#f4f6fa]">48ms</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                    <span>Indexer lag</span>
                    <span className="text-[#f4f6fa]">0.9 blocks</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                    <span>Proof sync</span>
                    <span className="text-[#f4f6fa]">Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
