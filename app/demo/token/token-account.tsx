'use client';

import { useCallback, useState } from 'react';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  Transaction,
} from '@solana/web3.js';
import { DataDisplay } from '@/components/data-display';
import { Item, ItemActions, ItemHeader } from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';

function stringToPublicKey(address: string): PublicKey | null {
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

export function TokenAccount() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [mintInput, setMintInput] = useState('');

  const [result, setResult] = useState<{
    result: string;
    associatedTokenAccount: string;
    txSignature?: string;
    confirmation?: RpcResponseAndContext<SignatureResult>;
  } | null>(null);
  const [error, setError] = useState<unknown>();

  const handleCreateAssociatedTokenAccount = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (!publicKey) {
      setError('Please connect your wallet');
      setIsLoading(false);
      return;
    }

    const mintPublicKey = stringToPublicKey(mintInput);
    if (!mintPublicKey) {
      setError('Invalid mint public key');
      setIsLoading(false);
      return;
    }

    try {
      const associatedTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        publicKey,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const accountInfo = await connection.getAccountInfo(
        associatedTokenAccount,
      );

      if (accountInfo) {
        setResult({
          result: 'Exists',
          associatedTokenAccount: associatedTokenAccount.toBase58(),
        });
        return;
      }

      const transaction = new Transaction();

      transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey, // payer
          associatedTokenAccount, // associated token account address
          publicKey, // owner
          mintPublicKey, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
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
        associatedTokenAccount: associatedTokenAccount.toBase58(),
        txSignature,
        confirmation,
      });
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [connection, mintInput, publicKey, sendTransaction]);

  return (
    <>
      <Item className="grid gap-4" variant="outline">
        <ItemHeader className="font-bold text-lg">
          Create an Associated Token Account (ATA)
        </ItemHeader>

        <ItemActions>
          <ButtonGroup className="w-full">
            <Input
              placeholder="Enter mint account..."
              value={mintInput}
              onChange={(e) => setMintInput(e.target.value)}
              onKeyDown={async (e) =>
                e.key === 'Enter' && handleCreateAssociatedTokenAccount()
              }
            />
            <Button
              variant="outline"
              onClick={() => {
                setMintInput('');
                setError(null);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={async () => await handleCreateAssociatedTokenAccount()}
              disabled={isLoading || !connected || !mintInput.trim()}
            >
              Create ATA
            </Button>
          </ButtonGroup>
        </ItemActions>
      </Item>
      {result?.associatedTokenAccount && (
        <DataDisplay
          title="Associated Token Account"
          data={result.associatedTokenAccount}
          loading={isLoading}
          error={error}
        />
      )}
      {(result || error) && (
        <DataDisplay
          title={
            result
              ? result.result == 'Exists'
                ? 'Account already exists'
                : 'Transaction successful'
              : 'Transaction Failed'
          }
          data={result}
          loading={isLoading}
          error={error}
        />
      )}
    </>
  );
}
