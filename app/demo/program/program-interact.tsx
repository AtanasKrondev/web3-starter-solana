'use client';

import { useCallback, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Item, ItemHeader, ItemActions } from '@/components/ui/item';
import { useProgram } from '@/hooks/useProgram';
import { DataDisplay } from '@/components/data-display';
import { ButtonGroup } from '@/components/ui/button-group';
import { Icons } from '@/components/icons';
import { Program } from '@coral-xyz/anchor';
import { Counter } from '@/idl/idl';

const fetchCounterAccount = async (
  program: Program<Counter>,
  counterAddress: PublicKey,
  publicKey: PublicKey | null
) => {
  if (!publicKey || !program) return null;

  try {
    const { count } = await program.account.counter.fetch(counterAddress);
    if (typeof count === 'object' && 'toNumber' in count) {
      return count.toNumber();
    }
    return Number(count);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const executeCounterMethod = async (
  action: 'increment' | 'decrement',
  program: Program<Counter>,
  publicKey: PublicKey
) => {
  const method =
    action === 'increment'
      ? program.methods.increment()
      : program.methods.decrement();

  return await method
    .accounts({
      user: publicKey,
    })
    .rpc();
};

export function ProgramInteract() {
  const { program, counterAddress, publicKey, connected } = useProgram();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    action: string;
    txSignature: string;
  } | null>();
  const [error, setError] = useState<unknown>();

  const {
    data: counterData,
    error: counterError,
    isLoading: counterIsLoading,
    mutate: refreshCounter,
  } = useSWR(
    program && publicKey && !counterAddress.equals(PublicKey.default)
      ? ['counter', counterAddress.toString(), publicKey.toString()]
      : null,
    () => fetchCounterAccount(program, counterAddress, publicKey)
  );

  const executeCounterAction = useCallback(
    async (action: 'increment' | 'decrement') => {
      if (!publicKey || !program || loading) return;

      setLoading(true);
      setResult(null);
      setError(null);

      try {
        const txSignature = await executeCounterMethod(
          action,
          program,
          publicKey
        );
        setResult({ action, txSignature });
      } catch (error) {
        setError(error);
      } finally {
        await refreshCounter();
        setLoading(false);
      }
    },
    [publicKey, program, loading, refreshCounter]
  );

  return (
    <>
      <DataDisplay title="Program ID" data={program.programId.toString()} />
      <DataDisplay title="Counter Account" data={counterAddress.toString()} />
      <DataDisplay
        title="Counter Value"
        data={counterData}
        error={counterError}
        loading={counterIsLoading}
      />
      <Item className="grid gap-4" variant="outline">
        <ItemHeader className="font-bold text-lg">
          Interact with the Counter program on Solana Devnet
        </ItemHeader>

        <ItemActions>
          <ButtonGroup>
            <Button
              onClick={async () => await executeCounterAction('increment')}
              disabled={counterIsLoading || !connected || loading}
            >
              Increment
              <Icons.up />
            </Button>
            <Button
              onClick={async () => await executeCounterAction('decrement')}
              disabled={counterIsLoading || !connected || loading}
              variant="outline"
            >
              Decrement
              <Icons.down />
            </Button>
          </ButtonGroup>
        </ItemActions>
      </Item>
      {(result || error) && (
        <DataDisplay
          title={result ? 'Transaction Successful' : 'Transaction Failed'}
          data={result}
          error={error}
          loading={loading}
        />
      )}
    </>
  );
}
