'use client';

import { ShieldAlert } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import validateQuery from '~/lib/validateQuery';

export default function Error() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const hasError: boolean = validateQuery(error);

    return (
        <>
            {hasError && (
                <div className='w-full mb-2 px-2 py-0.5 flex items-center rounded-md text-red-600 border border-red-600 bg-red-300'>
                    <ShieldAlert size={16} className='mr-1' /> {error}
                </div>
            )}
        </>
    );
}
