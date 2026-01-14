import { SlotNumber } from '@/app/demo/network/slot-number';

export default function NetworkPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Network Information</h1>
      <SlotNumber />
    </div>
  );
}
