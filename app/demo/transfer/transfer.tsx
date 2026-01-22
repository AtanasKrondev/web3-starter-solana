'use client';

import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  RpcResponseAndContext,
  SignatureResult,
} from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataDisplay } from '@/components/data-display';
import { Item, ItemContent, ItemHeader } from '@/components/ui/item';

export function Transfer() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    result: string;
    from: string;
    to: string;
    amount: string;
    txSignature: string;
    confirmation: RpcResponseAndContext<SignatureResult>;
  } | null>(null);
  const [error, setError] = useState<unknown>();

  const isValidAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const transferSol = useCallback(async () => {
    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }

    if (!isValidAddress(destinationAddress)) {
      setError('Please enter a valid Solana address');
      return;
    }

    const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
    if (isNaN(lamports) || lamports <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const toPubkey = new PublicKey(destinationAddress);

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey,
        lamports,
      });

      const transaction = new Transaction().add(transferInstruction);

      const latestBlockhash = await connection.getLatestBlockhash();

      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      const txSignature = await sendTransaction(transaction, connection);

      const confirmation = await connection.confirmTransaction(
        {
          signature: txSignature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'confirmed',
      );

      setResult({
        result: 'Success',
        from: publicKey.toString(),
        to: destinationAddress,
        amount,
        txSignature,
        confirmation,
      });
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, destinationAddress, amount, connection, sendTransaction]);

  return (
    <>
      <Item variant="outline" className="grid">
        <ItemHeader className="font-bold text-lg">Send SOL</ItemHeader>
        <ItemContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination Address</Label>
            <Input
              id="destination"
              type="text"
              placeholder="Enter the receiver address"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value.trim())}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SOL)</Label>
            <Input
              id="amount"
              type="number"
              step="0.000000001"
              min="0.000000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={transferSol}
            disabled={isLoading || !publicKey}
            className="w-full"
          >
            Send
          </Button>
        </ItemContent>
      </Item>
      {(result || error) && (
        <DataDisplay
          title={result ? 'Transaction Successful' : 'Transaction Failed'}
          data={result}
          loading={isLoading}
          error={error}
        />
      )}
    </>
  );
}
