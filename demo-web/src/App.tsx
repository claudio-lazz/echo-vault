import { useState } from 'react'
import './index.css'

const navItems = [
  { label: 'Overview', id: 'overview', subtitle: 'Secure, permissioned context layer for AI agents' },
  { label: 'Vaults', id: 'vaults', subtitle: 'Inventory of encrypted context vaults' },
  { label: 'Records', id: 'records', subtitle: 'Recent activity and ingestion pipeline' },
  { label: 'Alerts', id: 'alerts', subtitle: 'Active incidents and grant anomalies' },
  { label: 'Audit', id: 'audit', subtitle: 'Immutable history of access & policy events' },
  { label: 'Settings', id: 'settings', subtitle: 'Runtime toggles & environment health' }
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

const vaults = [
  {
    name: 'Product Design',
    owner: 'Design Pod',
    status: 'Healthy',
    records: '248k',
    lastActivity: '3m ago',
    compliance: 'SOC2 + HIPAA'
  },
  {
    name: 'Market Intelligence',
    owner: 'Research Ops',
    status: 'Watch',
    records: '112k',
    lastActivity: '18m ago',
    compliance: 'SOC2'
  },
  {
    name: 'Ops Runbooks',
    owner: 'Infra',
    status: 'Locked',
    records: '52k',
    lastActivity: '2h ago',
    compliance: 'SOC2 + PCI'
  }
]

const records = [
  {
    label: 'Payload sealed',
    detail: 'Vault: Market Intelligence • 12MB',
    time: '2m ago',
    tag: 'Encrypt'
  },
  {
    label: 'Context request approved',
    detail: 'Subject: pilot-researcher • Scope: vault:market-intel',
    time: '11m ago',
    tag: 'Grant'
  },
  {
    label: 'Vault updated',
    detail: 'Owner: Design Pod • +1.2k records',
    time: '44m ago',
    tag: 'Ingest'
  },
  {
    label: 'Revocation posted',
    detail: 'Subject: sync-bot • Scope: vault:ops',
    time: '1h ago',
    tag: 'Revoke'
  }
]

const alerts = [
  {
    title: 'Grant expiring in 12 hours',
    detail: 'pilot-researcher on vault:market-intel',
    severity: 'Medium'
  },
  {
    title: 'Unusual decrypt spike',
    detail: 'Ops Runbooks vault saw 3x decrypt requests',
    severity: 'High'
  },
  {
    title: 'Indexer lag above threshold',
    detail: 'Lag: 2.1 blocks (target < 1.0)',
    severity: 'Low'
  }
]

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  Expiring: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  Revoked: 'bg-rose-500/20 text-rose-200 border-rose-500/30'
}

const vaultStatusStyles: Record<string, string> = {
  Healthy: 'text-emerald-200',
  Watch: 'text-amber-200',
  Locked: 'text-rose-200'
}

const alertSeverityStyles: Record<string, string> = {
  Low: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  Medium: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  High: 'border-rose-500/30 bg-rose-500/10 text-rose-200'
}

function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [settings, setSettings] = useState({
    strictOnchain: true,
    encryptedStorage: true,
    autoRotate: false,
    alertWebhook: true
  })

  const currentSection = navItems.find((item) => item.id === activeSection) ?? navItems[0]

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#f4f6fa]">
      <div className="flex h-screen">
        <aside className="w-64 border-r border-[#2A3040] bg-[#171B24] p-6">
          <div className="text-xl font-semibold tracking-tight">EchoVault</div>
          <div className="mt-8 space-y-2 text-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full rounded-lg px-3 py-2 text-left transition ${
                  item.id === activeSection ? 'bg-[#1f2430] text-white' : 'text-[#9AA4B2] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <header className="flex items-center justify-between border-b border-[#2A3040] bg-[#0f1117] px-8 py-6">
            <div>
              <div className="text-2xl font-semibold">{currentSection.label}</div>
              <div className="text-sm text-[#9AA4B2]">{currentSection.subtitle}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-[#2A3040] bg-[#171B24] px-4 py-2 text-xs text-[#9AA4B2]">
                Mock Mode
              </div>
              <div className="h-9 w-9 rounded-full bg-[#2BD4C8]" />
            </div>
          </header>

          {activeSection === 'overview' && (
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
                    <button className="w-full rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-left">
                      Encrypt payload
                    </button>
                    <button className="w-full rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-left">
                      Grant access
                    </button>
                    <button className="w-full rounded-lg border border-[#2A3040] bg-[#11141c] px-3 py-2 text-left">
                      Request context
                    </button>
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
          )}

          {activeSection === 'vaults' && (
            <section className="space-y-6 px-8 py-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#9AA4B2]">Vault inventory</div>
                      <div className="text-xs text-[#6B7280]">Active encrypted collections & ownership</div>
                    </div>
                    <button className="rounded-lg bg-[#3B3FEE] px-4 py-2 text-xs font-semibold">New vault</button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {vaults.map((vault) => (
                      <div
                        key={vault.name}
                        className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-[#f4f6fa]">{vault.name}</div>
                            <div className="text-xs text-[#9AA4B2]">Owner: {vault.owner}</div>
                          </div>
                          <div className={`text-xs font-semibold ${vaultStatusStyles[vault.status]}`}>{vault.status}</div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#9AA4B2] md:grid-cols-4">
                          <div>
                            <div className="uppercase tracking-wide text-[#6B7280]">Records</div>
                            <div className="text-[#f4f6fa]">{vault.records}</div>
                          </div>
                          <div>
                            <div className="uppercase tracking-wide text-[#6B7280]">Last activity</div>
                            <div className="text-[#f4f6fa]">{vault.lastActivity}</div>
                          </div>
                          <div>
                            <div className="uppercase tracking-wide text-[#6B7280]">Compliance</div>
                            <div className="text-[#f4f6fa]">{vault.compliance}</div>
                          </div>
                          <div>
                            <div className="uppercase tracking-wide text-[#6B7280]">Decrypt SLA</div>
                            <div className="text-[#f4f6fa]">&lt; 60ms</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div className="text-sm text-[#9AA4B2]">Compliance checks</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      Encryption keys rotated 4h ago
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      2 vaults in extended retention mode
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      1 vault pending export review
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'records' && (
            <section className="space-y-6 px-8 py-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#9AA4B2]">Activity stream</div>
                      <div className="text-xs text-[#6B7280]">Latest vault events and ingest milestones</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
                      <span className="rounded-full border border-[#2A3040] px-3 py-1">All</span>
                      <span className="rounded-full border border-[#2A3040] px-3 py-1">Encrypt</span>
                      <span className="rounded-full border border-[#2A3040] px-3 py-1">Grant</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {records.map((record) => (
                      <div key={record.label} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-[#f4f6fa]">{record.label}</div>
                          <span className="rounded-full border border-[#2A3040] px-2 py-1 text-[11px] text-[#9AA4B2]">
                            {record.tag}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-[#9AA4B2]">{record.detail}</div>
                        <div className="mt-2 text-xs text-[#6B7280]">{record.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div className="text-sm text-[#9AA4B2]">Ingestion snapshot</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      8 connectors active
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      92% schema validation pass rate
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      3 pending decrypt jobs
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'alerts' && (
            <section className="space-y-6 px-8 py-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#9AA4B2]">Active alerts</div>
                      <div className="text-xs text-[#6B7280]">Risk signals from grants & pipelines</div>
                    </div>
                    <button className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-[#9AA4B2]">
                      Resolve all
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.title} className="rounded-xl border border-[#2A3040] bg-[#11141c] p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-[#f4f6fa]">{alert.title}</div>
                          <span
                            className={`rounded-full border px-2 py-1 text-[11px] ${
                              alertSeverityStyles[alert.severity]
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-[#9AA4B2]">{alert.detail}</div>
                        <div className="mt-3 flex gap-2 text-xs">
                          <button className="rounded-lg border border-[#2A3040] px-3 py-1">Acknowledge</button>
                          <button className="rounded-lg bg-[#3B3FEE] px-3 py-1">Investigate</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div className="text-sm text-[#9AA4B2]">Alert routing</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      PagerDuty: connected
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      Slack channel: #echovault-alerts
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      On-call rota: Design Pod
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'audit' && (
            <section className="space-y-6 px-8 py-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#9AA4B2]">Audit trail</div>
                      <div className="text-xs text-[#6B7280]">Immutable log of on-chain and off-chain actions</div>
                    </div>
                    <button className="rounded-lg border border-[#2A3040] px-3 py-1 text-xs text-[#9AA4B2]">
                      Export CSV
                    </button>
                  </div>
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
                  <div className="text-sm text-[#9AA4B2]">Audit summary</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      128 on-chain events (24h)
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      42 policy checks executed
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      0 failed integrity checks
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'settings' && (
            <section className="space-y-6 px-8 py-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="col-span-2 rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div>
                    <div className="text-sm text-[#9AA4B2]">Runtime toggles</div>
                    <div className="text-xs text-[#6B7280]">Configure verification, storage, and alerting.</div>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      { key: 'strictOnchain', label: 'Strict on-chain validation', detail: 'Disallow off-chain fallbacks' },
                      { key: 'encryptedStorage', label: 'Encrypted blob storage', detail: 'Persist AES-GCM bundles' },
                      { key: 'autoRotate', label: 'Auto-rotate keys', detail: 'Rotate vault keys every 24h' },
                      { key: 'alertWebhook', label: 'Alert webhooks', detail: 'Send critical alerts to Slack/PagerDuty' }
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#f4f6fa]">{item.label}</div>
                          <div className="text-xs text-[#9AA4B2]">{item.detail}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof typeof settings]}
                          onChange={(event) =>
                            setSettings((prev) => ({
                              ...prev,
                              [item.key]: event.target.checked
                            }))
                          }
                          className="h-4 w-4 accent-[#3B3FEE]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
                  <div className="text-sm text-[#9AA4B2]">Environment</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      API: https://api.echovault.local
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      RPC: https://solana-devnet.rpc
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      Storage: /var/lib/echovault
                    </div>
                    <div className="rounded-xl border border-[#2A3040] bg-[#11141c] px-3 py-2">
                      Deploy: hash 9f3c2d1
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
