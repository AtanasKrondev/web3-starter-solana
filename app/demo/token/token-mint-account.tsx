'use client';

import { useCallback, useState } from 'react';
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  RpcResponseAndContext,
  SignatureResult,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { DataDisplay } from '@/components/data-display';
import { Item, ItemActions, ItemHeader } from '@/components/ui/item';
import { Button } from '@/components/ui/button';

export function TokenMintAccount() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    result: string;
    mintAddress: string;
    txSignature: string;
    confirmation: RpcResponseAndContext<SignatureResult>;
  } | null>(null);
  const [error, setError] = useState<unknown>();

  const handleInitializeMint = useCallback(async () => {
    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const mint = Keypair.generate();

      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
      );

      transaction.add(
        createInitializeMintInstruction(
          mint.publicKey, // mint pubkey
          9, // decimals
          publicKey, // mint authority
          publicKey, // freeze authority (you can set this to null if you don't need it)
          TOKEN_PROGRAM_ID,
        ),
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('confirmed');

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const txSignature = await sendTransaction(transaction, connection, {
        signers: [mint],
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
        mintAddress: mint.publicKey.toBase58(),
        txSignature,
        confirmation,
      });
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, sendTransaction]);

  return (
    <>
      <Item className="grid gap-4" variant="outline">
        <ItemHeader className="font-bold text-lg">
          Create a token mint account
        </ItemHeader>

        <ItemActions>
          <Button
            onClick={async () => await handleInitializeMint()}
            disabled={isLoading || !connected}
          >
            Create mint account
          </Button>
        </ItemActions>
      </Item>
      {result?.mintAddress && (
        <DataDisplay
          title="Mint account address"
          data={result.mintAddress}
          loading={isLoading}
          error={error}
        />
      )}
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
