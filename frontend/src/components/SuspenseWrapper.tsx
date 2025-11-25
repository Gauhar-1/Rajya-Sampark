import { ReactNode, Suspense as ReactSuspense } from 'react';

interface SuspenseWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
    const defaultFallback = (
        <div className="flex items-center justify-center p-8">
            <div className="animate-pulse space-y-4 w-full max-w-md">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
        </div>
    );

    return (
        <ReactSuspense fallback={fallback || defaultFallback}>
            {children}
        </ReactSuspense>
    );
}
