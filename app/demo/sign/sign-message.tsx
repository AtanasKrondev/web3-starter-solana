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
import { DataDisplay } from '@/components/data-display';

export function SignMessage() {
  const wallet = useWallet();

  const [messageInput, setMessageInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    signature: string;
  } | null>(null);
  const [error, setError] = useState<unknown>();

  const handleSignMessage = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    if (!wallet.signMessage) {
      setError('Wallet does not support message signing');
      return;
    }

    try {
      const message = new TextEncoder().encode(messageInput.trim());
      const signature = await wallet.signMessage(message);
      setResult({
        message: messageInput,
        signature: Buffer.from(signature).toString('hex'),
      });
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Item variant="outline" className="grid">
        <ItemHeader className="font-bold text-lg">Message</ItemHeader>
        <ItemActions>
          <ButtonGroup className="w-full">
            <Input
              placeholder="Message to sign..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <Button onClick={handleSignMessage} disabled={!messageInput.trim()}>
              Sign
            </Button>
          </ButtonGroup>
        </ItemActions>
      </Item>
      {(result || error) && (
        <DataDisplay
          title={result ? 'Signing Successful' : 'Signing Failed'}
          data={result}
          error={error}
          loading={loading}
        />
      )}
    </>
  );
}
