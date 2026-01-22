import { RequestAirdrop } from '@/app/demo/account/request-airdrop';
import { LookupBalance } from '@/app/demo/account/lookup-balance';
import { LookupTokenBalances } from '@/app/demo/account/lookup-token-balances';
import { ConnectButton } from '@/components/connect-button';
import { Connected } from '@/components/connected';
import { AccountAddress } from '@/components/account-address';
import { AccountBalance } from '@/components/account-balance';

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
          <AccountAddress />
          <AccountBalance />
          <RequestAirdrop />
          <LookupBalance />
          <LookupTokenBalances />
        </Connected>
      </div>
    </div>
  );
}
