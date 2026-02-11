export function Footer() {
  return (
    <footer className="border-t border-[#1c2333] bg-[#0b0f17] px-4 py-4 text-xs text-[#9AA4B2] sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#2A3040] bg-[#11141c] px-3 py-1 text-[11px] text-white">
            Solana
          </span>
          <a
            className="text-[#9AA4B2] hover:text-white"
            href="https://echo-vault-two.vercel.app/"
            target="_blank"
            rel="noreferrer"
          >
            Project
          </a>
          <a
            className="text-[#9AA4B2] hover:text-white"
            href="https://github.com/claudio-lazz/echo-vault"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="text-[#9AA4B2] hover:text-white"
            href="https://solana.com/"
            target="_blank"
            rel="noreferrer"
          >
            Solana
          </a>
        </div>
        <div className="text-[11px] text-[#9AA4B2]">EchoVault · Context you control</div>
      </div>
    </footer>
  );
}
