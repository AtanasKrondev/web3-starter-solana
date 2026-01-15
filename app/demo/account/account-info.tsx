'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Skeleton } from '@/components/ui/skeleton';

const fetchBalance = async (connection: Connection, publicKey: PublicKey) => {
  return connection.getBalance(publicKey);
};

const fetchAccountInfo = async (
  connection: Connection,
  publicKey: PublicKey
) => {
  return connection.getAccountInfo(publicKey);
};

const fetchRecentSignatures = async (
  connection: Connection,
  publicKey: PublicKey
) => {
  return connection.getSignaturesForAddress(publicKey, { limit: 10 });
};

export function AccountInfo() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const publicKey = wallet.publicKey ?? null;

  const [status, setStatus] = useState<string | null>(null);

  // Lookup arbitrary wallet address balance
  const [lookupInput, setLookupInput] = useState('');
  const [lookupKey, setLookupKey] = useState<PublicKey | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  // Custom message to sign
  const [messageInput, setMessageInput] = useState('');

  const {
    data: lookupBalance,
    error: lookupBalanceError,
    isLoading: lookupBalanceLoading,
    mutate: mutateLookupBalance,
  } = useSWR(
    connection && lookupKey
      ? ['lookupBalance', connection.rpcEndpoint, lookupKey.toBase58()]
      : null,
    async () => (lookupKey ? fetchBalance(connection, lookupKey) : null),
    {
      refreshInterval: 5000,
      dedupingInterval: 2000,
      revalidateOnFocus: true,
    }
  );

  const handleLookup = () => {
    setLookupError(null);
    if (!lookupInput) {
      setLookupError('Enter an address to lookup');
      setLookupKey(null);
      return;
    }
    try {
      const pk = new PublicKey(lookupInput.trim());
      setLookupKey(pk);
    } catch (err) {
      setLookupError('Invalid public key');
      setLookupKey(null);
    }
  };

  const {
    data: balance,
    error: balanceError,
    isLoading: balanceLoading,
    mutate: mutateBalance,
  } = useSWR(
    connection && publicKey
      ? ['balance', connection.rpcEndpoint, publicKey.toBase58()]
      : null,
    async () => (publicKey ? fetchBalance(connection, publicKey) : 0),
    {
      refreshInterval: 5000,
      dedupingInterval: 2000,
      revalidateOnFocus: true,
    }
  );

  const {
    data: accountInfo,
    error: accountInfoError,
    isLoading: accountInfoLoading,
  } = useSWR(
    connection && publicKey
      ? ['accountInfo', connection.rpcEndpoint, publicKey.toBase58()]
      : null,
    async () => (publicKey ? fetchAccountInfo(connection, publicKey) : null),
    {
      refreshInterval: 30000,
      dedupingInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  const {
    data: signatures,
    error: signaturesError,
    isLoading: signaturesLoading,
  } = useSWR(
    connection && publicKey
      ? ['signatures', connection.rpcEndpoint, publicKey.toBase58()]
      : null,
    async () => (publicKey ? fetchRecentSignatures(connection, publicKey) : []),
    {
      refreshInterval: 10000,
      dedupingInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  const handleAirdrop = async () => {
    setStatus(null);
    if (!connection || !publicKey) {
      setStatus('Connect a wallet first');
      return;
    }

    try {
      // Try requesting a small airdrop (1 SOL). This may fail on mainnet.
      const sig = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      setStatus('Airdrop requested — awaiting confirmation...');
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: sig,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
      setStatus('Airdrop confirmed');
      mutateBalance();
    } catch (err) {
      setStatus((err as Error)?.message ?? 'Airdrop failed');
    }
  };

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="text-sm text-muted-foreground">
          Interact with your connected wallet and view account details.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-md font-semibold">Wallet</h3>
          <div className="text-sm">
            {publicKey ? (
              <div className="font-mono break-all">{publicKey.toBase58()}</div>
            ) : (
              <div className="text-muted-foreground">Not connected</div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            {!publicKey ? (
              <button
                className="btn"
                onClick={() =>
                  wallet.connect().catch(() => setStatus('Connection failed'))
                }
              >
                Connect
              </button>
            ) : (
              <>
                <button
                  className="btn"
                  onClick={() =>
                    wallet
                      .disconnect()
                      .catch(() => setStatus('Disconnect failed'))
                  }
                >
                  Disconnect
                </button>
                <button className="btn" onClick={handleSignMessage}>
                  Sign Message
                </button>
                <button className="btn" onClick={handleAirdrop}>
                  Request Airdrop (1 SOL)
                </button>
              </>
            )}
          </div>

          {publicKey ? (
            <div className="pt-2">
              <input
                className="input"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message to sign"
              />
            </div>
          ) : null}

          {status ? (
            <div className="text-sm text-muted-foreground pt-2">{status}</div>
          ) : null}

          <div className="pt-2">
            <label className="text-sm font-medium">
              Lookup Address Balance
            </label>
            <div className="flex gap-2 pt-2">
              <input
                className="input"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="Enter wallet address"
              />
              <button className="btn" onClick={handleLookup}>
                Lookup
              </button>
              <button
                className="btn"
                onClick={() => {
                  setLookupInput('');
                  setLookupKey(null);
                  setLookupError(null);
                }}
              >
                Clear
              </button>
            </div>

            {lookupError ? (
              <div className="text-destructive text-sm pt-2">{lookupError}</div>
            ) : lookupBalanceLoading ? (
              <Skeleton className="h-6 w-48 pt-2" />
            ) : lookupBalanceError ? (
              <div className="text-destructive text-sm pt-2">
                Error:{' '}
                {(lookupBalanceError as Error)?.message ?? 'Failed to fetch'}
              </div>
            ) : lookupBalance != null ? (
              <div className="text-sm font-mono pt-2">
                {(lookupBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-md font-semibold">Balance</h3>
          {balanceLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : balanceError ? (
            <div className="text-destructive">
              Error:{' '}
              {(balanceError as Error)?.message ?? 'Failed to fetch balance'}
            </div>
          ) : (
            <div className="text-2xl font-mono font-bold">
              {typeof balance === 'number'
                ? (balance / LAMPORTS_PER_SOL).toFixed(4)
                : '-'}{' '}
              SOL
            </div>
          )}

          <div className="pt-2">
            <h3 className="text-md font-semibold">Account Info</h3>
            {accountInfoLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : accountInfoError ? (
              <div className="text-destructive">
                Error:{' '}
                {(accountInfoError as Error)?.message ??
                  'Failed to fetch account info'}
              </div>
            ) : (
              <pre className="text-sm font-mono bg-muted p-2 rounded whitespace-pre-wrap break-all">
                {JSON.stringify(accountInfo, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
