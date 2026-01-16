'use client';

import { FC, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface ConnectedProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const Connected: FC<ConnectedProps> = ({ children, fallback }) => {
  const { connected } = useWallet();

  if (!connected) return fallback || null;

  return children;
};
