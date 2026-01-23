import { PublicKey } from '@solana/web3.js';

export function stringToPublicKey(address: string): PublicKey | null {
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}
