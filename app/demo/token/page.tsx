import { ConnectButton } from '@/components/connect-button';
import { Connected } from '@/components/connected';
import { TokenMint } from './token-mint';

export default function TokenPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-4xl font-bold">Token</h1>
        <span className="text-muted-foreground text-xl">
          Mint and send tokens
        </span>
      </div>
      <div className="space-y-6">
        <Connected fallback={<ConnectButton />}>
          <TokenMint />
        </Connected>
      </div>
    </div>
  );
}
