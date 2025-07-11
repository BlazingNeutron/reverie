create table public.yjs_updates (
  id uuid not null default extensions.uuid_generate_v4 (),
  doc_id text not null,
  update text not null,
  created_at timestamp with time zone null default now(),
  user_permission uuid null,
  constraint yjs_updates_pkey primary key (id),
  constraint yjs_updates_user_permission_fkey foreign KEY (user_permission) references auth.users (id)
) TABLESPACE pg_default;