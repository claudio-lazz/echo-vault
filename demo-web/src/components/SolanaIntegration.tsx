import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SectionCard } from './SectionCard';
import { solanaEndpoint } from '../lib/solana';

export function SolanaIntegration() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  return (
    <SectionCard
      title="Solana integration"
      subtitle="Onchain identity + access controls for EchoVault"
    >
      <div className="flex flex-col gap-4 text-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-xs text-[#9AA4B2]">
          <div>
            Context NFTs + Access Grants are anchored on Solana for auditable ownership and revocation.
          </div>
          <div>
            Network: {connection.rpcEndpoint ? connection.rpcEndpoint : solanaEndpoint}
          </div>
          <div>
            Wallet: {connected && publicKey ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-4)}` : 'Not connected'}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#2A3040] bg-[#11141c] px-3 py-1 text-[11px] text-[#9AA4B2]">
            Wallet Standard
          </span>
          <WalletMultiButton className="!h-auto !rounded-lg !bg-[#3B3FEE] !px-4 !py-2 !text-xs" />
        </div>
      </div>
    </SectionCard>
  );
}
