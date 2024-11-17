## Setup Supabase

### Activate Supabase Storage

#### Authentication: Policies: storage.objects

Make `storage.objects` public.

### API Settings: Exposed schemas

The list of exposed schemas must include:

1. `public` (default)
2. `graphql_public` (default)
3. `storage`

### Execute

Execute these scripts in the SQL editor:

#### Disable RLS for `storage.objects`

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

#### Unique constraint for `storage.objects` (in order to prevent bugs)

```sql
-- Specify the schema if necessary (replace 'your_schema' with your actual schema name)
SET search_path TO storage;

-- Step 1: Add a unique constraint on (name, bucket_id)
ALTER TABLE objects
ADD CONSTRAINT unique_name_bucket UNIQUE (name, bucket_id);

-- Step 2: Check for existing constraints on the objects table
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE conrelid = 'objects'::regclass;

-- Step 3: Identify any duplicate records based on (name, bucket_id)
SELECT name, bucket_id, COUNT(*)
FROM objects
GROUP BY name, bucket_id
HAVING COUNT(*) > 1;
```
