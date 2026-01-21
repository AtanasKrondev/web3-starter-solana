// app/demo/token/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getAccount,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { Button } from '@/components/ui/button';
import { DataDisplay } from '@/components/data-display';
// import { useToast } from '@/components/ui/use-toast';

// Token mint address
const TOKEN_MINT = new PublicKey(
  'EmXq3Ni9gfudTiyNKzzYvpnQqnJEMRw2ttnVXoJXjLo1'
);
// Token decimals (you'll need to set this based on your token's decimals)
const TOKEN_DECIMALS = 9; // Update this with your token's decimals

export default function TokenPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  // const { toast } = useToast();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState<string>('100'); // Default mint amount
  const [tokenInfo, setTokenInfo] = useState<{
    mintAuthority: string | null;
    supply: string;
    decimals: number;
    isInitialized: boolean;
    freezeAuthority: string | null;
  } | null>(null);

  // Get token balance
  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      // Get the associated token account
      const associatedTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        publicKey
      );

      // Get the token account info
      const accountInfo = await getAccount(connection, associatedTokenAccount);
      // Convert the raw amount (in smallest unit) to a human-readable amount
      const amount = Number(accountInfo.amount) / Math.pow(10, TOKEN_DECIMALS);
      setBalance(amount.toString());
    } catch (error: any) {
      // If token account doesn't exist, set balance to 0
      if (error.message.includes('TokenAccountNotFoundError')) {
        setBalance('0');
      } else {
        console.error('Error fetching token balance:', error);
        
      }
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  // Fetch token information
  const fetchTokenInfo = useCallback(async () => {
    if (!publicKey) return;

    try {
      const mintInfo = await connection.getAccountInfo(TOKEN_MINT);
      if (!mintInfo) return;

      // Parse mint account data
      const mintData = mintInfo.data;
      const mintAuthority = mintData.slice(4, 36).toString('hex');
      const supply = new DataView(mintData.buffer, 36, 8).getBigUint64(0, true);
      const decimals = mintData[44];
      const isInitialized = mintData[45] === 1;
      const freezeAuthority = mintData[46] === 0 
        ? null 
        : mintData.slice(47, 79).toString('hex');

      setTokenInfo({
        mintAuthority: mintAuthority ? new PublicKey(mintAuthority).toString() : null,
        supply: (Number(supply) / Math.pow(10, decimals)).toString(),
        decimals,
        isInitialized,
        freezeAuthority: freezeAuthority ? new PublicKey(freezeAuthority).toString() : null,
      });
    } catch (error) {
      console.error('Error fetching token info:', error);
    }
  }, [connection, publicKey]);

  // Fetch token info when component mounts or publicKey changes
  useEffect(() => {
    fetchTokenInfo();
  }, [fetchTokenInfo]);

  // Mint tokens
  const mintTokens = useCallback(async () => {
    if (!publicKey) {
      console.log('No public key available');
      return;
    }

    try {
      setIsLoading(true);

      // Get or create the associated token account
      const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey, // Payer (must sign)
        TOKEN_MINT, // Mint address
        publicKey, // Owner of the token account
        false // Allow owner off curve (must be false for associated token accounts)
      );

      console.log('Associated Token Account:', associatedTokenAccount.address.toString());

      // Create mint instruction
      const mintAmountInSmallestUnit = BigInt(Math.round(Number(mintAmount) * Math.pow(10, TOKEN_DECIMALS)));
      console.log('Minting amount (smallest units):', mintAmountInSmallestUnit.toString());

      // Get the mint info to check the mint authority
      const mintInfo = await connection.getAccountInfo(TOKEN_MINT);
      console.log('Mint info:', mintInfo);
      
      // Check if the connected wallet is the mint authority
      const mintAuthority = mintInfo?.data.slice(4, 36); // Mint authority is at offset 4-36 in the mint account data
      const isMintAuthority = mintAuthority && publicKey.equals(new PublicKey(mintAuthority));
      console.log('Is connected wallet the mint authority?', isMintAuthority);

      if (!isMintAuthority) {
        throw new Error('Connected wallet is not the mint authority for this token');
      }

      const mintInstruction = createMintToInstruction(
        TOKEN_MINT, // Mint address
        associatedTokenAccount.address, // Destination token account
        publicKey, // Mint authority (must sign)
        mintAmountInSmallestUnit // Amount to mint (in smallest unit)
      );

      console.log('Created mint instruction');

      // Create and send transaction
      const transaction = new Transaction().add(mintInstruction);
      transaction.feePayer = publicKey;
      
      // Get recent blockhash and set it on the transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      console.log('Got latest blockhash:', blockhash);
      transaction.recentBlockhash = blockhash;

      console.log('Sending transaction...');
      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent, signature:', signature);

      console.log('Waiting for confirmation...');
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      
      console.log('Transaction confirmed:', confirmation);
      console.log(`Successfully minted ${mintAmount} tokens`);

      // Refresh balance
      await fetchTokenBalance();
    } catch (error) {
      console.error('Error in mintTokens:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        raw: JSON.stringify(error)
      });
      
      // More specific error handling
      if (error.message.includes('User rejected the request')) {
        console.error('User rejected the transaction');
      } else if (error.message.includes('insufficient funds')) {
        console.error('Insufficient SOL for transaction fees');
      } else if (error.message.includes('invalid account data')) {
        console.error('Invalid account data - check if the token account exists');
      } else if (error.message.includes('mint authority')) {
        console.error('Mint authority error - check if your wallet is the mint authority');
      }
      
      throw error; // Re-throw to potentially show in UI
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, sendTransaction, mintAmount, fetchTokenBalance]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Token Management</h1>

      <div className="grid gap-4">
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Token Information</h2>
            <button 
              onClick={fetchTokenInfo} 
              className="text-sm text-blue-500 hover:text-blue-600"
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
          <div className="space-y-2">
            <DataDisplay title="Token Mint" data={TOKEN_MINT.toString()} copyable />
            <DataDisplay
              title="Your Balance"
              data={`${balance} Tokens`}
              loading={isLoading}
            />
            {tokenInfo && (
              <>
                <DataDisplay 
                  title="Total Supply" 
                  data={`${tokenInfo.supply} Tokens`} 
                />
                <DataDisplay 
                  title="Decimals" 
                  data={tokenInfo.decimals.toString()} 
                />
                <DataDisplay 
                  title="Mint Authority" 
                  data={tokenInfo.mintAuthority || "None"} 
                  copyable={!!tokenInfo.mintAuthority}
                />
                <DataDisplay 
                  title="Freeze Authority" 
                  data={tokenInfo.freezeAuthority || "None"} 
                  copyable={!!tokenInfo.freezeAuthority}
                />
                <DataDisplay 
                  title="Status" 
                  data={tokenInfo.isInitialized ? "Initialized" : "Not Initialized"} 
                />
              </>
            )}
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mint Tokens</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Amount to Mint
              </label>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="w-full p-2 border rounded"
                min="1"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={mintTokens} disabled={isLoading || !publicKey}>
                {isLoading ? 'Processing...' : 'Mint Tokens'}
              </Button>
              <Button
                variant="outline"
                onClick={fetchTokenBalance}
                disabled={isLoading}
              >
                Refresh Balance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
