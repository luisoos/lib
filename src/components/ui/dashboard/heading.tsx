import { ReactNode } from 'react';
import { cn } from '~/hooks/utils';

export function Title({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <h2
            className={cn(
                className,
                'mb-2 flex items-center font-medium text-2xl',
            )}>
            {children}
        </h2>
    );
}

export function Heading({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <h2 className={cn(className, 'flex items-center font-medium text-xl')}>
            {children}
        </h2>
    );
}

export function Subheading({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <h2 className={cn(className, 'flex items-center font-normal text-lg')}>
            {children}
        </h2>
    );
}

export function Description({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <h2 className={cn(className, 'flex items-center text-md')}>
            {children}
        </h2>
    );
}
