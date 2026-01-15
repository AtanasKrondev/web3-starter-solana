import { AccountInfo } from '@/app/demo/account/account-info';

export default function AccountPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold">Account</h1>
        <span className="text-muted-foreground text-xl">
          View and interact with your connected wallet account.
        </span>
      </div>
      <AccountInfo />
    </div>
  );
}
