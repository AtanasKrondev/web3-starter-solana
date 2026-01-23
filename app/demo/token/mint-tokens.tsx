'use client';

import { DataDisplay } from '@/components/data-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemHeader } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { stringToPublicKey } from '@/lib/helpers';
import { createMintToInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  LAMPORTS_PER_SOL,
  RpcResponseAndContext,
  SignatureResult,
  Transaction,
} from '@solana/web3.js';
import { useState } from 'react';

export function MintTokens() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('0.1');
  const [mintAccountInput, setMintAccountInput] = useState('');
  const [associatedTokenAccountInput, setAssociatedTokenAccountInput] =
    useState('');

  const [result, setResult] = useState<{
    result: string;
    mintAddress: string;
    amount: string | number;
    txSignature: string;
    confirmation: RpcResponseAndContext<SignatureResult>;
  } | null>(null);
  const [error, setError] = useState<unknown>();

  const handleMintTokens = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }

    const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
    if (isNaN(lamports) || lamports <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const mintPublicKey = stringToPublicKey(mintAccountInput);
    if (!mintPublicKey) {
      setError('Invalid mint public key');
      setIsLoading(false);
      return;
    }

    const associatedTokenAccountPublicKey = stringToPublicKey(
      associatedTokenAccountInput,
    );
    if (!associatedTokenAccountPublicKey) {
      setError('Invalid associated token account public key');
      setIsLoading(false);
      return;
    }

    try {
      const transaction = new Transaction();

      transaction.add(
        createMintToInstruction(
          mintPublicKey, // mint
          associatedTokenAccountPublicKey, // destination
          publicKey, // authority
          lamports, // amount
          [], // multiSigners
          TOKEN_PROGRAM_ID, // programId
        ),
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('confirmed');

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const txSignature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
      });

      const confirmation = await connection.confirmTransaction(
        {
          signature: txSignature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed',
      );

      setResult({
        result: 'Success',
        mintAddress: mintAccountInput,
        amount: lamports / LAMPORTS_PER_SOL,
        txSignature,
        confirmation,
      });
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Item className="grid gap-4" variant="outline">
        <ItemHeader className="font-bold text-lg">Mint tokens</ItemHeader>

        <ItemContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mint">Mint account</Label>
            <Input
              id="mint"
              placeholder="Enter mint account address..."
              value={mintAccountInput}
              onChange={(e) => setMintAccountInput(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ata">Associated Token Account</Label>
            <Input
              id="ata"
              placeholder="Enter ATA address..."
              value={associatedTokenAccountInput}
              onChange={(e) => setAssociatedTokenAccountInput(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount tokens</Label>
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
            onClick={async () => await handleMintTokens()}
            disabled={isLoading}
            className="w-full"
          >
            Mint
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
