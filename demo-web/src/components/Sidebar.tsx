const navItems = [
  { label: 'Overview', id: 'overview' },
  { label: 'Operations Flow', id: 'demo' },
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
    <aside className="w-full border-b border-[#2A3040] bg-[#171B24] p-4 sm:w-64 sm:border-b-0 sm:border-r sm:p-6">
      <div className="flex items-center gap-3">
        <img
          src="/echovault-logo.svg"
          alt="EchoVault logo"
          className="h-8 w-8 rounded-xl border border-[#2A3040] bg-[#0f1117] p-1 sm:h-9 sm:w-9"
        />
        <div className="text-lg font-semibold tracking-tight sm:text-xl">EchoVault</div>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 text-xs sm:mt-8 sm:block sm:space-y-2 sm:overflow-visible sm:pb-0 sm:text-sm">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-left sm:w-full ${
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
