'use client';

import { useSolanaNetwork } from '@/components/solana-provider';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Item, ItemContent, ItemHeader } from '@/components/ui/item';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function NetworkSwitch() {
  const isMounted = useMounted();
  const { connection } = useConnection();

  const { network, setNetwork, customEndpoint, setCustomEndpoint } =
    useSolanaNetwork();
  // Detect network cluster from RPC endpoint
  const rpcEndpoint = connection?.rpcEndpoint ?? '';

  if (!isMounted)
    return (
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
    );

  return (
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
  );
}
