import { cn } from '~/hooks/utils';

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-primary/10', className)}
            {...props}
        />
    );
}

function Skeleton2({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'h-5 w-full rounded-md mx-2 mb-2 bg-zinc-400',
                className,
            )}
            {...props}
        />
    );
}

export { Skeleton, Skeleton2 };
