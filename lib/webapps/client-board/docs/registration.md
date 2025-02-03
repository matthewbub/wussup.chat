# Registration

When a user registers for an account, we use the native Supabase methods to create the user via a [Server Action](../app/login/actions.ts). Upon successful registration, the user is redirected to the [Onboarding](../app/onboarding/page.tsx) page where they will register their "Client Name".

> Dev note: This process assigns them a unique `Application_Clients.id`
