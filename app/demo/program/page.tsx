import { ProgramInteract } from '@/app/demo/program/program-interact';
import { ConnectButton } from '@/components/connect-button';
import { Connected } from '@/components/connected';

export default function ProgramPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-4xl font-bold">Solana Program</h1>
        <span className="text-muted-foreground text-xl">
          Interact with a Solana program on Devnet.
        </span>
      </div>
      <div className="space-y-6">
        <Connected fallback={<ConnectButton />}>
          <ProgramInteract />
        </Connected>
      </div>
    </div>
  );
}
