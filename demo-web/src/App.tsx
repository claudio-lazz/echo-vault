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
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
