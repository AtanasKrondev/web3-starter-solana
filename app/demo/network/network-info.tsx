'use client';

import useSWR from 'swr';
import { Connection } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSolanaNetwork } from '@/components/solana-provider';
import { Item, ItemContent, ItemHeader } from '@/components/ui/item';
import { useMounted } from '@/hooks/useMounted';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DataDisplay } from '@/components/data-display';

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

export function NetworkInfo() {
  const { connection } = useConnection();
  const isMounted = useMounted();

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

  const { network, setNetwork, customEndpoint, setCustomEndpoint } =
    useSolanaNetwork();
  // Detect network cluster from RPC endpoint
  const rpcEndpoint = connection?.rpcEndpoint ?? '';

  return (
    <div className="space-y-6">
      {isMounted ? (
        <Item variant="outline">
          <ItemHeader className="font-bold text-lg">Network</ItemHeader>
          <ItemContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="text-lg font-semibold">
                Connected to <span className="text-primary">{network}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-fit">
                    Switch
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select Network</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setNetwork('devnet')}
                    className={network === 'devnet' ? 'bg-accent' : ''}
                  >
                    devnet
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setNetwork('testnet')}
                    className={network === 'testnet' ? 'bg-accent' : ''}
                  >
                    testnet
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setNetwork('mainnet-beta')}
                    className={network === 'mainnet-beta' ? 'bg-accent' : ''}
                  >
                    mainnet-beta
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setNetwork('local')}
                    className={network === 'local' ? 'bg-accent' : ''}
                  >
                    local
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setNetwork('custom')}
                    className={network === 'custom' ? 'bg-accent' : ''}
                  >
                    custom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {network === 'custom' ? (
              <Input
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://custom-rpc.example"
              />
            ) : null}

            <code className="text-sm font-mono bg-muted p-2 rounded block">
              <div>Endpoint: {rpcEndpoint || 'not available'}</div>
              <div>Selected: {network}</div>
            </code>
          </ItemContent>
        </Item>
      ) : (
        <Item variant="outline">
          <ItemHeader className="font-bold text-lg">Network</ItemHeader>
          <ItemContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-9 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </ItemContent>
        </Item>
      )}
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
