'use client';

import {
  FC,
  ReactNode,
  useMemo,
  createContext,
  useContext,
  useState,
} from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import the wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaProviderProps {
  children: ReactNode;
}

export type NetworkName =
  | 'devnet'
  | 'testnet'
  | 'mainnet-beta'
  | 'local'
  | 'custom';

interface SolanaNetworkContextValue {
  network: NetworkName;
  setNetwork: (n: NetworkName) => void;
  customEndpoint: string;
  setCustomEndpoint: (e: string) => void;
}

const SolanaNetworkContext = createContext<SolanaNetworkContextValue | null>(
  null
);

export const useSolanaNetwork = () => {
  const ctx = useContext(SolanaNetworkContext);
  if (!ctx)
    throw new Error('useSolanaNetwork must be used within SolanaProvider');
  return ctx;
};

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // Initialize network from localStorage or default to devnet
  const [network, setNetwork] = useState<NetworkName>(() => {
    try {
      const stored =
        typeof window !== 'undefined'
          ? localStorage.getItem('solanaNetwork')
          : null;
      return (stored as NetworkName) || 'devnet';
    } catch {
      return 'devnet';
    }
  });

  const [customEndpoint, setCustomEndpoint] = useState<string>(() => {
    try {
      return typeof window !== 'undefined'
        ? localStorage.getItem('solanaCustomEndpoint') || ''
        : '';
    } catch {
      return '';
    }
  });

  const endpoint = useMemo(() => {
    if (network === 'local') return 'http://localhost:8899';
    if (network === 'custom') return customEndpoint || 'http://localhost:8899';
    // devnet, testnet, mainnet-beta
    if (
      network === 'devnet' ||
      network === 'testnet' ||
      network === 'mainnet-beta'
    ) {
      return clusterApiUrl(network);
    }
    return customEndpoint || 'http://localhost:8899';
  }, [network, customEndpoint]);

  // Persist selection
  const setNetworkAndPersist = (n: NetworkName) => {
    setNetwork(n);
    try {
      localStorage.setItem('solanaNetwork', n);
    } catch {}
  };

  const setCustomEndpointAndPersist = (e: string) => {
    setCustomEndpoint(e);
    try {
      localStorage.setItem('solanaCustomEndpoint', e);
    } catch {}
  };

  return (
    <SolanaNetworkContext.Provider
      value={{
        network,
        setNetwork: setNetworkAndPersist,
        customEndpoint,
        setCustomEndpoint: setCustomEndpointAndPersist,
      }}
    >
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaNetworkContext.Provider>
  );
};
