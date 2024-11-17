import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient(schema?: string) {
    const cookieStore = cookies();

    const options = {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(
                cookiesToSet: {
                    name: string;
                    value: string;
                    options: any;
                }[],
            ) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options),
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        },
        db: {
            schema: schema || 'public', // Default to 'public' if no schema is provided
        },
    };

    return createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        options,
    );
}
