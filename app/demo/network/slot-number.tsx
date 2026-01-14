'use client';

import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Skeleton } from '@/components/ui/skeleton';

export function SlotNumber() {
  const { connection } = useConnection();
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(connection);

  useEffect(() => {
    const fetchBlockNumber = async () => {
      try {
        setLoading(true);
        setError(null);
        // getSlot() returns the current slot number, which is the latest block number
        const slot = await connection.getSlot();
        setBlockNumber(slot);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch block number'
        );
        console.error('Error fetching block number:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockNumber();
    // Optionally refresh every 5 seconds
    const interval = setInterval(fetchBlockNumber, 5000);

    return () => clearInterval(interval);
  }, [connection]);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Latest Block Number</h2>

      {loading ? (
        <Skeleton className="h-8 w-48" />
      ) : error ? (
        <div className="text-destructive">Error: {error}</div>
      ) : (
        <div className="text-2xl font-mono font-bold">
          {blockNumber?.toLocaleString()}
        </div>
      )}
    </div>
  );
}
