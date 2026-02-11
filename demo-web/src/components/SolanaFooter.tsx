import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function SolanaFooter() {
  return (
    <footer className="border-t border-[#1c2333] bg-[#0b0f17] px-4 py-4 text-xs text-[#9AA4B2] sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-white">Built on Solana</div>
          <div>
            EchoVault anchors ownership + access grants onchain. Connect any Solana wallet to verify identity
            and sign access requests.
          </div>
        </div>
        <WalletMultiButton className="!h-auto !rounded-lg !bg-[#3B3FEE] !px-4 !py-2 !text-xs" />
      </div>
    </footer>
  );
}
