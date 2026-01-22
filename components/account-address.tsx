'use client';

import { useProgram } from '@/hooks/useProgram';
import { DataDisplay } from './data-display';

export function AccountAddress() {
  const { publicKey } = useProgram();
  return <DataDisplay title={'Account address'} data={publicKey?.toString()} />;
}
