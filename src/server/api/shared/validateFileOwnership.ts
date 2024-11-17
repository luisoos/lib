import { SupabaseClient } from '@supabase/supabase-js';

// Function to validate file ownership
export async function validateFileOwnership(
    supabase: SupabaseClient<any, string, any>,
    fileId: string,
    userId: string,
) {
    const { data: fileData, error: fileError } = await supabase
        .from('objects')
        .select('name')
        .eq('id', fileId)
        .single();

    if (!fileData || fileError) {
        console.error('Error fetching path tokens:', fileError);
        return false;
    }

    return fileData.name.match(/^([^\/]+)/)[1] === userId; // Ensure correct comparison
}
