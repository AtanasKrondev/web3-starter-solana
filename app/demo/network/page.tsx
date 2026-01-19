import { NetworkSwitch } from '@/app/demo/network/network-switch';
import { NetworkInfo } from '@/app/demo/network/network-info';

export default function NetworkPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-4xl font-bold">Network</h1>
        <span className="text-muted-foreground text-xl">
          Fetch information about the Solana network.
        </span>
      </div>
      <div className="space-y-6">
        <NetworkSwitch />
        <NetworkInfo />
      </div>
    </div>
  );
}
