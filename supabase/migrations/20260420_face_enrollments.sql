-- Face enrollments: one row per user, storing the averaged MobileFaceNet embedding.
-- Embeddings are 192-dim Float32 arrays; stored as jsonb for flexibility.

create table if not exists public.face_enrollments (
  user_id uuid primary key references auth.users(id) on delete cascade,
  embedding jsonb not null,
  enrolled_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  device_info jsonb
);

alter table public.face_enrollments enable row level security;

drop policy if exists "face_enrollments_select_own" on public.face_enrollments;
create policy "face_enrollments_select_own"
  on public.face_enrollments for select
  using (auth.uid() = user_id);

drop policy if exists "face_enrollments_insert_own" on public.face_enrollments;
create policy "face_enrollments_insert_own"
  on public.face_enrollments for insert
  with check (auth.uid() = user_id);

drop policy if exists "face_enrollments_update_own" on public.face_enrollments;
create policy "face_enrollments_update_own"
  on public.face_enrollments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "face_enrollments_delete_own" on public.face_enrollments;
create policy "face_enrollments_delete_own"
  on public.face_enrollments for delete
  using (auth.uid() = user_id);

create or replace function public.touch_face_enrollments_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists face_enrollments_updated_at on public.face_enrollments;
create trigger face_enrollments_updated_at
  before update on public.face_enrollments
  for each row execute function public.touch_face_enrollments_updated_at();
