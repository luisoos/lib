## Setup Supabase

### Activate Supabase Storage

#### Authentication: Policies: storage.objects

Make `storage.objects` public.

### API Settings: Exposed schemas

The list of exposed schemas must include:

1. `public` (default)
2. `graphql_public` (default)
3. `storage`
