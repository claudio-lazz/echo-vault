import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter,
  ExodusWalletAdapter,
  LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets';

const network = (import.meta.env.VITE_SOLANA_NETWORK as string | undefined) ?? 'mainnet-beta';
export const solanaEndpoint =
  (import.meta.env.VITE_SOLANA_RPC as string | undefined) ??
  clusterApiUrl(network as Parameters<typeof clusterApiUrl>[0]);

export function SolanaProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
      new ExodusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
