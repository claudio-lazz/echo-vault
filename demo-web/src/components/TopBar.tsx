import { useDataMode } from '../lib/dataMode';

type TopBarProps = {
  title: string;
  subtitle?: string;
};

export function TopBar({ title, subtitle = 'Secure, permissioned context layer for AI agents' }: TopBarProps) {
  const { mode } = useDataMode();

  return (
    <header className="flex flex-col gap-4 border-b border-[#2A3040] bg-[#0f1117] px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="text-xl font-semibold sm:text-2xl">{title}</div>
        <div className="text-xs text-[#9AA4B2] sm:text-sm">{subtitle}</div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="rounded-xl border border-[#2A3040] bg-[#171B24] px-3 py-2 text-[10px] uppercase tracking-wide text-[#9AA4B2] sm:px-4 sm:text-xs">
          {mode === 'live' ? 'Live Mode' : 'Local Mode'}
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
