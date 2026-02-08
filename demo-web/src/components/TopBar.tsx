import { useDataMode } from '../lib/dataMode';

type TopBarProps = {
  title: string;
  subtitle?: string;
};

export function TopBar({ title, subtitle = 'Secure, permissioned context layer for AI agents' }: TopBarProps) {
  const { mode } = useDataMode();

  return (
    <header className="flex items-center justify-between border-b border-[#2A3040] bg-[#0f1117] px-8 py-6">
      <div>
        <div className="text-2xl font-semibold">{title}</div>
        <div className="text-sm text-[#9AA4B2]">{subtitle}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-xl border border-[#2A3040] bg-[#171B24] px-4 py-2 text-xs text-[#9AA4B2]">
          {mode === 'live' ? 'Live Mode' : 'Mock Mode'}
        </div>
        <img
          src="/echovault-logo.svg"
          alt="EchoVault logo"
          className="h-9 w-9 rounded-xl border border-[#2A3040] bg-[#0f1117] p-1"
        />
      </div>
    </header>
  );
}
