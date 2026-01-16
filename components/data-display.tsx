import { Item, ItemContent, ItemHeader } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { CopyButton } from '@/components/copy-button';

export function DataDisplay({
  title,
  data,
  error,
  loading,
}: {
  title: string;
  data: unknown;
  error?: unknown;
  loading?: boolean;
}) {
  return (
    <Item variant="outline">
      <ItemHeader className="font-bold text-lg">{title}</ItemHeader>
      {loading ? (
        <Skeleton className="h-6 w-64" />
      ) : error ? (
        <div className="text-destructive text-sm">
          Error: {error instanceof Error ? error.message : 'Failed to fetch'}
        </div>
      ) : (
        <ItemContent>
          <div className="relative">
            <CopyButton
              text={
                typeof data === 'string' ? data : JSON.stringify(data, null, 2)
              }
              className="absolute top-1 right-1 z-10"
            />
            <pre className="text-sm font-mono bg-muted p-2 rounded whitespace-pre-wrap break-all min-h-9">
              {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </ItemContent>
      )}
    </Item>
  );
}
