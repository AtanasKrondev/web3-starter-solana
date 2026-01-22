'use client';

import { useProgram } from '@/hooks/useProgram';
import { DataDisplay } from './data-display';
import useSWR from 'swr';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

const fetchBalance = async (connection: Connection, publicKey: PublicKey) => {
  return connection.getBalance(publicKey);
};

export function AccountBalance() {
  const { connection, publicKey } = useProgram();

  const {
    data: balance,
    error: balanceError,
    isLoading: balanceLoading,
  } = useSWR(
    connection && publicKey
      ? ['balance', connection.rpcEndpoint, publicKey.toBase58()]
      : null,
    async () => (publicKey ? fetchBalance(connection, publicKey) : 0),
    {
      refreshInterval: 3000,
    },
  );

  return (
    <DataDisplay
      title="Account balance (SOL)"
      data={typeof balance === 'number' ? balance / LAMPORTS_PER_SOL : '-'}
      error={balanceError}
      loading={balanceLoading}
    />
  );
}
