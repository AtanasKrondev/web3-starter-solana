'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Connection, PublicKey } from '@solana/web3.js';
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

interface TokenAccountInfo {
  mint: string;
  owner: string;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
}

const fetchTokenAccounts = async (
  connection: Connection,
  publicKey: PublicKey
) => {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    }
  );

  return tokenAccounts.value.map((account) => ({
    mint: account.account.data.parsed.info.mint,
    owner: account.account.data.parsed.info.owner,
    tokenAmount: account.account.data.parsed.info.tokenAmount,
  }));
};

export function LookupTokenBalances() {
  const { connection } = useConnection();

  const [lookupInput, setLookupInput] = useState(
    'CHSB9txfbr9M4aKTSNmZpRtS9DdXQmzF86bAcoUaVzhN'
  );
  const [lookupKey, setLookupKey] = useState<PublicKey | null>(null);
  const [lookupError, setLookupError] = useState<unknown>(null);

  const { data: tokenAccounts, isLoading: isLoadingTokenAccounts } = useSWR<
    TokenAccountInfo[]
  >(
    connection && lookupKey
      ? ['lookupTokenBalances', connection.rpcEndpoint, lookupKey.toBase58()]
      : null,
    async () => (lookupKey ? fetchTokenAccounts(connection, lookupKey) : []),
    {
      refreshInterval: 10000,
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
    <Item variant="outline" className="grid">
      <ItemHeader className="font-bold text-lg">
        Lookup Token Balances
      </ItemHeader>
      <ItemActions>
        <ButtonGroup className="w-full">
          <Input
            placeholder="Enter wallet address..."
            value={lookupInput}
            onChange={(e) => setLookupInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
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
      <ItemContent>
        {lookupError ? (
          <div className="text-destructive text-sm p-2">
            Error:{' '}
            {lookupError instanceof Error
              ? lookupError.message
              : 'Failed to fetch token accounts'}
          </div>
        ) : isLoadingTokenAccounts ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : tokenAccounts && tokenAccounts.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b">
              <div className="col-span-8 font-medium">Token Mint</div>
              <div className="col-span-4 font-medium text-right">Balance</div>
            </div>
            <div className="divide-y">
              {tokenAccounts.map((account, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50"
                >
                  <div className="col-span-8">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm truncate">
                        {account.mint}
                      </span>
                      <CopyButton text={account.mint} className="shrink-0" />
                    </div>
                  </div>
                  <div className="col-span-4 text-right font-mono text-sm">
                    {account.tokenAmount.uiAmountString}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : lookupKey ? (
          <div className="text-muted-foreground text-center py-4 border rounded-md">
            No token accounts found for this address
          </div>
        ) : null}
      </ItemContent>
    </Item>
  );
}
