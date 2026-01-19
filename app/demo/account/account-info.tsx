'use client';

import useSWR from 'swr';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { DataDisplay } from '@/components/data-display';

const fetchBalance = async (connection: Connection, publicKey: PublicKey) => {
  return connection.getBalance(publicKey);
};

export function AccountInfo() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const publicKey = wallet.publicKey ?? null;

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
    }
  );

  return (
    <div className="space-y-6">
      <DataDisplay title={'Account address'} data={publicKey?.toString()} />
      <DataDisplay
        title="Account balance (SOL)"
        data={typeof balance === 'number' ? balance / LAMPORTS_PER_SOL : '-'}
        error={balanceError}
        loading={balanceLoading}
      />
    </div>
  );
}
