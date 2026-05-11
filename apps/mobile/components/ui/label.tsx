import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn('text-foreground text-sm font-medium leading-none', className)} {...props} />
  );
}

export { Label };
