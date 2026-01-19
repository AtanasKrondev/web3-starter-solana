'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
} from '@/components/ui/item';
import { useWallet } from '@solana/wallet-adapter-react';

export function SignMessage() {
  const wallet = useWallet();
  const publicKey = wallet.publicKey ?? null;

  const [status, setStatus] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const handleSignMessage = async () => {
    setStatus(null);
    if (!wallet || !publicKey) {
      setStatus('Connect a wallet first');
      return;
    }

    if (!wallet.signMessage) {
      setStatus('Wallet does not support message signing');
      return;
    }

    try {
      const text =
        messageInput && messageInput.trim().length > 0
          ? messageInput
          : 'Sign this message to authenticate';
      const message = new TextEncoder().encode(text);
      const signature = await wallet.signMessage(message);
      setStatus(
        `Message signed: ${Buffer.from(signature)
          .toString('hex')
          .slice(0, 16)}...`
      );
    } catch (err) {
      setStatus((err as Error)?.message ?? 'Signing failed');
    }
  };

  return (
    <Item variant="outline" className="grid">
      <ItemHeader className="font-bold text-lg">Sign message</ItemHeader>
      <ItemActions>
        <ButtonGroup className="w-full">
          <Input
            placeholder="Message to sign..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <Button onClick={handleSignMessage}>Sign</Button>
        </ButtonGroup>
      </ItemActions>

      <ItemContent>
        {status ? <ItemDescription>{status}</ItemDescription> : null}
      </ItemContent>
    </Item>
  );
}
