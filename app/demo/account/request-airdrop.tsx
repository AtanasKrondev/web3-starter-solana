'use client';

import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
} from '@/components/ui/item';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState } from 'react';

export function RequestAirdrop() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const publicKey = wallet.publicKey ?? null;

  const [status, setStatus] = useState<string | null>(null);

  const handleAirdrop = async () => {
    setStatus(null);
    if (!connection || !publicKey) {
      setStatus('Connect a wallet first');
      return;
    }

    try {
      setStatus('Requesting airdrop...');
      const sig = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      setStatus('Airdrop requested — awaiting confirmation...');
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: sig,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setStatus('Airdrop confirmed');
    } catch (err) {
      setStatus((err as Error)?.message ?? 'Airdrop failed');
    }
  };

  return (
    <Item variant="outline" className="grid">
      <ItemHeader className="font-bold text-lg">Request Airdrop</ItemHeader>
      <ItemActions>
        <Button onClick={handleAirdrop}>Request 1 SOL</Button>
      </ItemActions>

      <ItemContent>
        {status ? <ItemDescription>{status}</ItemDescription> : null}
      </ItemContent>
    </Item>
  );
}
