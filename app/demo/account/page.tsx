import { AccountInfo } from '@/app/demo/account/account-info';
import { RequestAirdrop } from '@/app/demo/account/request-airdrop';
import { SignMessage } from '@/app/demo/account/sign-message';
import { LookupBalance } from '@/app/demo/account/lookup-balance';
import { LookupTokenBalances } from '@/app/demo/account/lookup-token-balances';
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
      <div className="space-y-6">
        <Connected fallback={<ConnectButton />}>
          <AccountInfo />
          <RequestAirdrop />
          <SignMessage />
          <LookupBalance />
          <LookupTokenBalances />
        </Connected>
      </div>
    </div>
  );
}
