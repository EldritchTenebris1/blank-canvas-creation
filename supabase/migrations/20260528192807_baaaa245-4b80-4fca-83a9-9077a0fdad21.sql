
-- Enums
create type public.app_role as enum ('admin', 'frentista');
create type public.movement_type as enum ('venda', 'entrada', 'reposicao', 'ajuste');

-- user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

-- employees
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  access_code text unique not null,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- suppliers
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  created_at timestamptz not null default now()
);

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  brand text,
  internal_code text unique,
  barcode text,
  description text,
  image_url text,
  pista_qty int not null default 0,
  estoque_qty int not null default 0,
  pista_min int not null default 0,
  estoque_min int not null default 0,
  cost_price numeric(10,2) not null default 0,
  sale_price numeric(10,2) not null default 0,
  supplier_id uuid references public.suppliers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- movements
create table public.movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  type public.movement_type not null,
  quantity int not null,
  location text not null default 'pista',
  notes text,
  created_at timestamptz not null default now()
);

create index movements_created_idx on public.movements(created_at desc);
create index movements_product_idx on public.movements(product_id);
create index movements_user_idx on public.movements(user_id);

-- Grants
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

grant select, insert, update, delete on public.employees to authenticated;
grant all on public.employees to service_role;

grant select, insert, update, delete on public.suppliers to authenticated;
grant all on public.suppliers to service_role;

grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;

grant select, insert, update, delete on public.movements to authenticated;
grant all on public.movements to service_role;

-- RLS
alter table public.user_roles enable row level security;
alter table public.employees enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.movements enable row level security;

-- user_roles policies
create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- employees policies
create policy "admins manage employees" on public.employees for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "frentista reads self" on public.employees for select to authenticated using (user_id = auth.uid());

-- suppliers
create policy "admins manage suppliers" on public.suppliers for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "auth read suppliers" on public.suppliers for select to authenticated using (true);

-- products
create policy "admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "auth read products" on public.products for select to authenticated using (true);
create policy "frentistas update product qty" on public.products for update to authenticated using (public.has_role(auth.uid(),'frentista')) with check (public.has_role(auth.uid(),'frentista'));

-- movements
create policy "admins manage movements" on public.movements for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "auth read movements" on public.movements for select to authenticated using (true);
create policy "frentistas insert sales" on public.movements for insert to authenticated with check (public.has_role(auth.uid(),'frentista') and type = 'venda' and user_id = auth.uid());

-- First user becomes admin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
