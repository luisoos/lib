export default function validateQuery(query: any): boolean {
    if (!query) return false;

    if (Array.isArray(query)) {
        return query[0] && query[0].trim() !== '';
    } else {
        return typeof query === 'string' && query.trim() !== '';
    }
}
