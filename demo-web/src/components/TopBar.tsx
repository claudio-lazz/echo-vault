export function TopBar() {
  return (
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
  );
}
