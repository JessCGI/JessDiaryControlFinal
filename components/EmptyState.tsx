import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    message: string;
}

export default function EmptyState({ icon, message }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 opacity-20">
            {icon}
            <p className="mt-4 font-mono text-sm uppercase tracking-widest">{message}</p>
        </div>
    );
}
