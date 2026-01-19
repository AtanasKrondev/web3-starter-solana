'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/copy-button';

const fetchBalance = async (connection: Connection, publicKey: PublicKey) => {
  return connection.getBalance(publicKey);
};

export function LookupBalance() {
  const { connection } = useConnection();

  const [lookupInput, setLookupInput] = useState('');
  const [lookupKey, setLookupKey] = useState<PublicKey | null>(null);
  const [lookupError, setLookupError] = useState<unknown>(null);

  const { data: lookupBalance, isLoading: lookupBalanceLoading } = useSWR(
    connection && lookupKey
      ? ['lookupBalance', connection.rpcEndpoint, lookupKey.toBase58()]
      : null,
    async () => (lookupKey ? fetchBalance(connection, lookupKey) : null),
    {
      refreshInterval: 5000,
      onError: (err) => setLookupError(err),
    }
  );

  const handleLookup = () => {
    setLookupError(null);
    if (!lookupInput) {
      setLookupError('Enter an address to lookup');
      setLookupKey(null);
      return;
    }
    try {
      const pk = new PublicKey(lookupInput.trim());
      setLookupKey(pk);
    } catch {
      setLookupError('Invalid public key');
      setLookupKey(null);
    }
  };

  return (
    <>
      <Item variant="outline" className="grid">
        <ItemHeader className="font-bold text-lg">
          Lookup Address Balance
        </ItemHeader>
        <ItemActions>
          <ButtonGroup className="w-full">
            <Input
              placeholder="Enter wallet address..."
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => {
                setLookupInput('');
                setLookupKey(null);
                setLookupError(null);
              }}
            >
              Clear
            </Button>
            <Button onClick={handleLookup} disabled={!lookupInput.trim()}>
              Lookup
            </Button>
          </ButtonGroup>
        </ItemActions>
        {lookupBalanceLoading ? (
          <Skeleton className="h-6 w-64" />
        ) : lookupError ? (
          <div className="text-destructive text-sm">
            Error:{' '}
            {lookupError instanceof Error
              ? lookupError.message
              : 'Failed to fetch'}
          </div>
        ) : lookupBalance ? (
          <ItemContent>
            <div className="relative">
              <CopyButton
                text={
                  typeof lookupBalance === 'number'
                    ? `${lookupBalance / LAMPORTS_PER_SOL}`
                    : '-'
                }
                className="absolute top-1 right-1 z-10"
              />
              <pre className="text-sm font-mono bg-muted p-2 rounded whitespace-pre-wrap break-all min-h-9">
                {typeof lookupBalance === 'number'
                  ? lookupBalance / LAMPORTS_PER_SOL
                  : '-'}
              </pre>
            </div>
          </ItemContent>
        ) : null}
      </Item>
    </>
  );
}
