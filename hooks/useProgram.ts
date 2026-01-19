'use client';

import { useMemo } from 'react';
import { Program, web3, AnchorProvider } from '@coral-xyz/anchor';

import { PublicKey } from '@solana/web3.js';
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';

import { Counter } from '@/idl/idl';
import Idl from '@/idl/idl.json';

interface UseProgramReturn {
  program: Program<Counter>;
  counterAddress: PublicKey;
  publicKey: PublicKey | null;
  connected: boolean;
  connection: web3.Connection;
}

export function useProgram(): UseProgramReturn {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!connection) return undefined;

    const provider = wallet
      ? new AnchorProvider(connection, wallet, {
          preflightCommitment: 'confirmed',
        })
      : new AnchorProvider(connection, {} as never, {
          preflightCommitment: 'confirmed',
        });

    return new Program<Counter>(Idl, provider);
  }, [connection, wallet]);

  const counterAddress = useMemo(() => {
    if (!program) return PublicKey.default;
    return PublicKey.findProgramAddressSync(
      [Buffer.from('counter')],
      program.programId
    )[0];
  }, [program]);

  return {
    program: program!,
    counterAddress,
    publicKey: publicKey || null,
    connected: connected || false,
    connection,
  };
}
