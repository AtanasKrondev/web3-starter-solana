'use client';

import { useMounted } from '@/hooks/useMounted';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletDropdownButton() {
  const {
    connected,
    publicKey,
    wallet,
    disconnect,
    connecting,
    disconnecting,
  } = useWallet();
  const { setVisible, visible } = useWalletModal();

  if (!connected) {
    return (
      <Button
        onClick={() => setVisible(true)}
        disabled={visible}
        variant="outline"
      >
        Connect Wallet
      </Button>
    );
  }

  if (connecting) {
    return (
      <Button disabled variant="outline">
        Connecting...
      </Button>
    );
  }

  if (disconnecting) {
    return (
      <Button disabled variant="outline">
        Disconnecting...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {wallet?.adapter?.icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              className="size-5"
            />
          )}

          <span className="text-sm">
            {shortenAddress(publicKey!.toBase58())}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setVisible(true)}>
          <Icons.wallet />
          Change wallet
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(publicKey!.toBase58())}
        >
          <Icons.copy />
          Copy address
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={disconnect}
          className="text-destructive hover:text-destructive"
        >
          <Icons.logout />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ConnectButton() {
  const mounted = useMounted();

  if (!mounted) {
    return <Skeleton className="h-9 w-33.5" />;
  }

  return <WalletDropdownButton />;
}
