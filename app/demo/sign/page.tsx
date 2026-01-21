import { SignMessage } from '@/app/demo/sign/sign-message';
import { ConnectButton } from '@/components/connect-button';
import { Connected } from '@/components/connected';

export default function AccountPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-4xl font-bold">Sign message</h1>
        <span className="text-muted-foreground text-xl">
          Sign a custom message with your wallet
        </span>
      </div>
      <div className="space-y-6">
        <Connected fallback={<ConnectButton />}>
          <SignMessage />
        </Connected>
      </div>
    </div>
  );
}
