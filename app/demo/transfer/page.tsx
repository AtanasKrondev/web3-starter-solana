import { ConnectButton } from '@/components/connect-button';
import { Connected } from '@/components/connected';
import { Transfer } from '@/app/demo/transfer/transfer';
import { NetworkSwitch } from '../../../components/network-switch';
import { AccountAddress } from '@/components/account-address';
import { AccountBalance } from '@/components/account-balance';

export default function TransferPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-4xl font-bold">Transfer SOL</h1>
        <span className="text-muted-foreground text-xl">
          Send SOL to another account
        </span>
      </div>
      <div className="space-y-6">
        <Connected fallback={<ConnectButton />}>
          <NetworkSwitch />
          <AccountAddress />
          <AccountBalance />
          <Transfer />
        </Connected>
      </div>
    </div>
  );
}
