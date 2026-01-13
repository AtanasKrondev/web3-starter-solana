'use client';

import * as React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { SolanaProvider } from '@/components/solana-provider';

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SolanaProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SolanaProvider>
  );
}
