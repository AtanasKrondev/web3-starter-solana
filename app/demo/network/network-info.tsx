'use client';

import useSWR from 'swr';
import { Connection } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Item, ItemContent, ItemHeader } from '@/components/ui/item';

const fetchSlot = async (connection: Connection) => {
  return connection.getSlot();
};

const fetchEpochInfo = async (connection: Connection) => {
  return connection.getEpochInfo();
};

const fetchTransactionCount = async (connection: Connection) => {
  return connection.getTransactionCount();
};

const fetchGenesisHash = async (connection: Connection) => {
  return connection.getGenesisHash();
};

const fetchLatestBlockhash = async (connection: Connection) => {
  return connection.getLatestBlockhash();
};

const fetchSlotLeader = async (connection: Connection) => {
  const slot = await connection.getSlot();
  return connection.getSlotLeader({ minContextSlot: slot });
};

function DataDisplay({
  title,
  data,
  error,
  loading,
}: {
  title: string;
  data: unknown;
  error: unknown;
  loading: boolean;
}) {
  return (
    <Item variant="outline">
      <ItemHeader className="font-bold text-lg">{title}</ItemHeader>
      {loading ? (
        <Skeleton className="h-6 w-64" />
      ) : error ? (
        <div className="text-destructive text-sm">
          Error: {error instanceof Error ? error.message : 'Failed to fetch'}
        </div>
      ) : (
        <ItemContent>
          <code className="text-sm font-mono bg-muted p-2 rounded">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(data, null, 2)}
            </pre>
          </code>
        </ItemContent>
      )}
    </Item>
  );
}

export function NetworkInfo() {
  const { connection } = useConnection();

  const {
    data: blockNumber,
    error: slotError,
    isLoading: slotLoading,
  } = useSWR(
    connection ? ['slot', connection] : null,
    ([, conn]) => fetchSlot(conn),
    {
      refreshInterval: 5000,
    }
  );

  const {
    data: epochInfo,
    error: epochError,
    isLoading: epochLoading,
  } = useSWR(
    connection ? ['epochInfo', connection] : null,
    ([, conn]) => fetchEpochInfo(conn),
    {
      refreshInterval: 30000,
    }
  );

  const {
    data: transactionCount,
    error: transactionCountError,
    isLoading: transactionCountLoading,
  } = useSWR(
    connection ? ['transactionCount', connection] : null,
    ([, conn]) => fetchTransactionCount(conn),
    {
      refreshInterval: 10000,
    }
  );

  const {
    data: genesisHash,
    error: genesisHashError,
    isLoading: genesisHashLoading,
  } = useSWR(
    connection ? ['genesisHash', connection] : null,
    ([, conn]) => fetchGenesisHash(conn),
    {
      refreshInterval: 300000,
    }
  );

  const {
    data: latestBlockhash,
    error: latestBlockhashError,
    isLoading: latestBlockhashLoading,
  } = useSWR(
    connection ? ['latestBlockhash', connection] : null,
    ([, conn]) => fetchLatestBlockhash(conn),
    {
      refreshInterval: 10000,
    }
  );

  const {
    data: slotLeader,
    error: slotLeaderError,
    isLoading: slotLeaderLoading,
  } = useSWR(
    connection ? ['slotLeader', connection] : null,
    ([, conn]) => fetchSlotLeader(conn),
    {
      refreshInterval: 5000,
    }
  );

  return (
    <div className="space-y-6">
      <DataDisplay
        title="Latest Block Number (Slot)"
        data={blockNumber}
        error={slotError}
        loading={slotLoading}
      />
      <DataDisplay
        title="Epoch Info"
        data={epochInfo}
        error={epochError}
        loading={epochLoading}
      />
      <DataDisplay
        title="Transaction Count"
        data={transactionCount}
        error={transactionCountError}
        loading={transactionCountLoading}
      />
      <DataDisplay
        title="Genesis Hash"
        data={genesisHash}
        error={genesisHashError}
        loading={genesisHashLoading}
      />
      <DataDisplay
        title="Latest Blockhash"
        data={latestBlockhash}
        error={latestBlockhashError}
        loading={latestBlockhashLoading}
      />
      <DataDisplay
        title="Current Slot Leader"
        data={slotLeader}
        error={slotLeaderError}
        loading={slotLeaderLoading}
      />
    </div>
  );
}
