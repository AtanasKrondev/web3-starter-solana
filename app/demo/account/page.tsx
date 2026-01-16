import { AccountInfo } from '@/app/demo/account/account-info';
import { ConnectButton } from '@/components/connect-button';
import { Connected } from '@/components/connected';

export default function AccountPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-4xl font-bold">Account</h1>
        <span className="text-muted-foreground text-xl">
          View and interact with your connected wallet account.
        </span>
      </div>
      <Connected fallback={<ConnectButton />}>
        <AccountInfo />
      </Connected>
    </div>
  );
}
