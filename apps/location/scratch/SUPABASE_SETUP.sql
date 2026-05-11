-- 1. Create a table for profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  email text unique,
  role text default 'guest' check (role in ('guest', 'locationb', 'locationc', 'admin'))
);

-- 2. Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 3. Trigger to automatically create a profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'guest');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Initial Role Assignment (Optional Example)
-- Update a specific user to admin:
-- update profiles set role = 'admin' where email = 'your-email@example.com';
