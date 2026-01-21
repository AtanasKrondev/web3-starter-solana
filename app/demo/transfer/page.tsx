// app/demo/transfer/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataDisplay } from '@/components/data-display';

const LAMPORTS_PER_SOL = 1000000000; // 1 SOL = 1,000,000,000 lamports

export default function TransferPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('0.1'); // Default amount
  const [isLoading, setIsLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate Solana address
  const isValidAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle SOL transfer
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
      setTxSignature(null);

      const toPublicKey = new PublicKey(destinationAddress);

      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: toPublicKey,
        lamports,
      });

      // Create and send transaction
      const transaction = new Transaction().add(transferInstruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('Sending transaction...');
      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent, signature:', signature);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction confirmed');

      setTxSignature(signature);
    } catch (error: any) {
      console.error('Transfer failed:', error);
      setError(error.message || 'Failed to send SOL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, destinationAddress, amount, connection, sendTransaction]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Transfer SOL</h1>

      <div className="grid gap-4 max-w-2xl">
        <div className="bg-card p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Send SOL</h2>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination Address</Label>
            <Input
              id="destination"
              type="text"
              placeholder="Enter Solana address"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value.trim())}
              disabled={isLoading}
              className="font-mono"
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

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {txSignature && (
            <div className="space-y-2">
              <div className="text-green-500">Transfer successful!</div>
              <DataDisplay
                title="Transaction Signature"
                data={txSignature}
                copyable
                className="text-sm"
              />
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={transferSol}
              disabled={isLoading || !publicKey}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Send SOL'}
            </Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Wallet</h2>
          <div className="space-y-4">
            <DataDisplay
              title="Your Address"
              data={publicKey?.toString() || 'Not connected'}
              copyable={!!publicKey}
            />
            <DataDisplay
              title="Network"
              data={
                connection.rpcEndpoint.includes('devnet') ? 'Devnet' : 'Mainnet'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
