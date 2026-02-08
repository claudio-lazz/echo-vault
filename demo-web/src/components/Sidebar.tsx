const navItems = [
  { label: 'Overview', id: 'overview' },
  { label: 'Demo Flow', id: 'demo' },
  { label: 'Vaults', id: 'vaults' },
  { label: 'Records', id: 'records' },
  { label: 'Alerts', id: 'alerts' },
  { label: 'Audit', id: 'audit' },
  { label: 'Access Grants', id: 'grants' },
  { label: 'Playbooks', id: 'playbooks' },
  { label: 'Usage & Spend', id: 'usage' },
  { label: 'Settings', id: 'settings' }
];

type SidebarProps = {
  active: string;
  onSelect: (id: string) => void;
};

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-[#2A3040] bg-[#171B24] p-6">
      <div className="flex items-center gap-3">
        <img
          src="/echovault-logo.svg"
          alt="EchoVault logo"
          className="h-9 w-9 rounded-xl border border-[#2A3040] bg-[#0f1117] p-1"
        />
        <div className="text-xl font-semibold tracking-tight">EchoVault</div>
      </div>
      <div className="mt-8 space-y-2 text-sm">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full rounded-lg px-3 py-2 text-left ${
              item.id === active ? 'bg-[#1f2430] text-white' : 'text-[#9AA4B2]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
