# `/lib`

Chat with all of your documents at once. Perfect UX, great integrations.

## To-do

-   [ ] AI integration

## Tech Stack

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`. Both the Backend and Frontend are made using [Next.js](https://nextjs.org) with TypeScript. Furthermore, this project uses:

-   [NextAuth.js](https://next-auth.js.org)
-   [Supabase](https://supabase.com)
-   [Prisma](https://prisma.io)
-   [Tailwind CSS](https://tailwindcss.com)
-   [shadcn/ui](https://ui.shadcn.com)
-   [Prettier](https://prettier.io/)

## Installation

> [!IMPORTANT]
> This project is currently under development.

#### Connect to Supabase

Create a new Supabase project and get the credentials below from ORMs and App Frameworks:

```bash
# Connect to Supabase via connection pooling with Supavisor.
DATABASE_URL=""     # Retrieve from ORMs

# Direct connection to the database. Used for migrations.
DIRECT_URL=""       # Retrieve from ORMs

# Supabase credentials
SUPABASE_URL=""                         # Retrieve from App Frameworks > Next.js > App Router > supabase-js
SUPABASE_ANON_KEY=""                    # Retrieve from App Frameworks > Next.js > App Router > supabase-js
SUPABASE_SERVICE_ROLE_KEY=""            # Retrieve from Project Settings > API Keys > `service_role`
SUPABASE_BUCKET_NAME="lib-user-uploads" # Create new Supabase Bucket (for file storage), example name
```

#### Set-up Supabase Storage RLS

Go to the Supabase SQL Editor (`Project home > SQL Editor > New query`) and run the following queries to set up Row Level Security (RLS) for your storage bucket.

> [!NOTE]
> Make sure to replace `'lib-user-uploads'` with the name of your Supabase bucket if you chose a different one. The bucket name is defined in your `.env` file as `SUPABASE_BUCKET_NAME`.

1.  **Enable RLS on the `storage.objects` table**
    This ensures that all access to storage objects is governed by RLS policies.

    ```sql
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    ```

2.  **Create a policy to allow authenticated users to view objects**
    This policy allows the application to check file ownership. The application logic will still perform the final check to ensure a user can only access their own files.

    ```sql
    CREATE POLICY "Allow authenticated read access"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (true);
    ```

3.  **Create a policy to allow users to upload files**
    This policy ensures that when a user uploads a file, the file path starts with their own user ID.

    ```sql
    CREATE POLICY "Allow insert for authenticated users"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'lib-user-uploads' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
    ```

4.  **Create a policy to allow users to update their own files**
    This policy allows a user to update their own files. The `USING` clause checks if the user owns the file they are trying to update, and the `WITH CHECK` clause ensures they can't move it to a different user's folder.

    ```sql
    CREATE POLICY "Allow update for authenticated users"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'lib-user-uploads' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'lib-user-uploads' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
    ```

5.  **Create a policy to allow users to delete their own files**
    This policy allows a user to delete their own files.
    ```sql
    CREATE POLICY "Allow delete for authenticated users"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'lib-user-uploads' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
    ```

#### Expose Supabase Schemas

To work with Supabase Storage like in this case, add `storage` to the **Exposed schemas** in Supabase (Project Settings > Data API).

The list of exposed schemas must include:

1. `public` (default)
2. `graphql_public` (default)
3. `storage`

#### Set-up GitHub OAuth2

##### Create GitHub OAuth2 App

1. Create a new GitHub OAuth App ([GitHub Developer Settings](https://github.com/settings/developers) > OAuth Apps)
2. Use these inputs during creation:
    - Application Name (any string, e.g. `/lib`)
    - Homepage URL (e.g. `http://localhost:3000/`)
    - Authorization callback URL - this is specific to this application: domain/url (matching Homepage URL) + `/api/auth/callback/github` (e.g. `http://localhost:3000/api/auth/callback/github`)
3. Create and copy the Client ID and Client Secret and paste it into the Next-Auth GitHub Variables in your `.env`:

```
# Next Auth GitHub Provider
AUTH_GITHUB_ID="<CLIENT_ID>"
AUTH_GITHUB_SECRET="<CLIENT_SECRET>"
```

> [!IMPORTANT]
> Also generate a new `NEXTAUTH_SECRET` in your `.env`.

#### Create Supabase Vector Storage

```sql
-- Go to SQL Editor in Supabase Dashboard
-- Use "OpenAI Vector Search" quickstart template
create extension vector;

create table documents (
  id bigserial primary key,
  content text,
  embedding vector(1536),
  metadata jsonb
);

create index on documents using ivfflat (embedding vector_cosine_ops);
```

#### Install dependencies

```bash
yarn install
```

#### Serve in development

```bash
yarn dev
```

##### Commands for development

```bash
# Generate Prisma client and database schema
yarn db:generate

# Apply pending database migrations
yarn db:migrate

# Push schema changes to the database without migrations
yarn db:push

# Open Prisma Studio to view and edit data
yarn db:studio
```

#### Build

```bash
yarn build
```
