-- VINAYAGA CONSTRUCTION: run in Supabase SQL Editor, not in the website.
-- First create your admin under Authentication > Users > Add user > Create new user.
-- At the END of this file replace PASTE_YOUR_ADMIN_EMAIL_HERE with that email.
begin;
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.site_content (
  section text primary key check (section in ('projects','services','contact')),
  content jsonb not null,
  updated_at timestamptz not null default clock_timestamp(),
  constraint vc_content_shape check (
    (section in ('projects','services') and jsonb_typeof(content) = 'array') or
    (section = 'contact' and jsonb_typeof(content) = 'object')
  )
);
create table if not exists public.site_defaults (
  section text primary key,
  content jsonb not null
);
alter table public.site_admins enable row level security;
alter table public.site_content enable row level security;
alter table public.site_defaults enable row level security;
revoke all on public.site_admins, public.site_content, public.site_defaults from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant update on public.site_content to authenticated;
grant select on public.site_admins, public.site_defaults to authenticated;
drop policy if exists vc_admin_self on public.site_admins;
create policy vc_admin_self on public.site_admins for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists vc_public_read on public.site_content;
create policy vc_public_read on public.site_content for select to anon, authenticated using (true);
drop policy if exists vc_admin_update on public.site_content;
create policy vc_admin_update on public.site_content for update to authenticated
using (exists (select 1 from public.site_admins where user_id = (select auth.uid())))
with check (exists (select 1 from public.site_admins where user_id = (select auth.uid())));
drop policy if exists vc_defaults_read on public.site_defaults;
create policy vc_defaults_read on public.site_defaults for select to authenticated
using (exists (select 1 from public.site_admins where user_id = (select auth.uid())));

create or replace function public.vc_touch_content() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := greatest(clock_timestamp(), old.updated_at + interval '1 microsecond');
  return new;
end;
$$;
drop trigger if exists vc_content_timestamp on public.site_content;
create trigger vc_content_timestamp before update on public.site_content
for each row execute function public.vc_touch_content();

create or replace function public.reset_site_content() returns void
language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  update public.site_content c set content = d.content
  from public.site_defaults d where c.section = d.section;
  get diagnostics changed = row_count;
  if changed <> 3 then raise exception 'Admin permission or default content is missing'; end if;
end;
$$;
revoke all on function public.reset_site_content() from public, anon;
grant execute on function public.reset_site_content() to authenticated;

-- Public photo bucket: photos are intentionally visible on the public site.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists vc_photo_insert on storage.objects;
create policy vc_photo_insert on storage.objects for insert to authenticated
with check (bucket_id = 'project-images' and exists (select 1 from public.site_admins where user_id = (select auth.uid())));
-- No anonymous uploads, and no API photo overwrite/delete grants are added.
-- Unused photos can be removed later from Storage in the Supabase dashboard.

insert into public.site_defaults (section,content) values ('projects','[{"id": "proj_1", "title": "Luxury Villa", "location": "Karaikudi, Tamil Nadu", "category": "Residential • 4500 sq.ft", "status": "COMPLETED", "completionDate": "2024-03", "image": "image/ezgif-frame-050.jpg", "description": "Modern two-story luxury residence featuring expansive glass facades, private infinity pool, and integrated landscaped terraces."}, {"id": "proj_2", "title": "Modern Residence", "location": "Karaikudi, Tamil Nadu", "category": "Residential • 3200 sq.ft", "status": "COMPLETED", "completionDate": "2024-01", "image": "image/ezgif-frame-049.jpg", "description": "Contemporary family home with customized interior aesthetics, high-performance acoustic glass, and ambient evening LED illumination."}, {"id": "proj_3", "title": "Premium Estate", "location": "Karaikudi, Tamil Nadu", "category": "Residential • 5800 sq.ft", "status": "COMPLETED", "completionDate": "2023-11", "image": "image/ezgif-frame-048.jpg", "description": "Expansive luxury estate built with double-height living ceilings, organic stone cladding, and wide driveway parking."}, {"id": "proj_4", "title": "Contemporary Home", "location": "Karaikudi, Tamil Nadu", "category": "Residential • 2800 sq.ft", "status": "ONGOING", "completionDate": "2025-06", "image": "image/ezgif-frame-047.jpg", "description": "Minimalist architecture with optimal natural cross-ventilation, energy-efficient planning, and tailored spatial layout."}, {"id": "proj_5", "title": "Executive Bungalow", "location": "Karaikudi, Tamil Nadu", "category": "Residential • 3900 sq.ft", "status": "COMPLETED", "completionDate": "2023-08", "image": "image/ezgif-frame-046.jpg", "description": "High-end bespoke bungalow designed for executive lifestyles, premium entertainment spaces, and private manicured lawn."}, {"id": "proj_6", "title": "Designer Villa", "location": "Karaikudi, Tamil Nadu", "category": "Residential • 4100 sq.ft", "status": "ONGOING", "completionDate": "2025-08", "image": "image/ezgif-frame-045.jpg", "description": "Architectural masterpiece incorporating cantilevered balconies, smart automation, and bespoke interior wood accents."}]'::jsonb) on conflict (section) do nothing;
insert into public.site_defaults (section,content) values ('services','[{"id": "serv_1", "num": "01", "icon": "🏛️", "title": "Architectural Design", "desc": "Bespoke architectural concepts crafted to reflect your personality and lifestyle vision."}, {"id": "serv_2", "num": "02", "icon": "📐", "title": "Building Design & Planning", "desc": "Comprehensive building plans with regulatory compliance and engineering precision."}, {"id": "serv_3", "num": "03", "icon": "🏗️", "title": "Structural Construction", "desc": "Robust structural frameworks using premium materials and advanced construction techniques."}, {"id": "serv_4", "num": "04", "icon": "🔨", "title": "Renovation", "desc": "Transform existing spaces with thoughtful renovation that breathes new life into your property."}, {"id": "serv_5", "num": "05", "icon": "✨", "title": "Interior & Finishing", "desc": "Luxury interior finishing with premium materials, textures and craftsmanship throughout."}, {"id": "serv_6", "num": "06", "icon": "⚡", "title": "Electrical & Plumbing / MEP", "desc": "Complete MEP systems engineered for efficiency, safety and long-term reliability."}, {"id": "serv_7", "num": "07", "icon": "📊", "title": "Project Management", "desc": "End-to-end project management ensuring timely delivery within budget and quality standards."}, {"id": "serv_8", "num": "08", "icon": "🖥️", "title": "2D & 3D Planning", "desc": "Detailed 2D floor plans and photorealistic 3D visualisations before construction begins."}]'::jsonb) on conflict (section) do nothing;
insert into public.site_defaults (section,content) values ('contact','{"phone": "+91 9003837874", "email": "yugaseelanv2000@gmail.com", "location": "Karaikudi, Tamil Nadu", "whatsapp": "919003837874", "tagline": "FROM VISION TO REALITY.", "brandMessage": "Premium Construction • Thoughtful Design • Trusted Execution"}'::jsonb) on conflict (section) do nothing;

-- Seed once only. Re-running this file does NOT replace saved site content.
insert into public.site_content (section,content)
select section,content from public.site_defaults on conflict (section) do nothing;

-- EDIT THIS EMAIL to the exact email of the Auth user you created:
do $$
declare admin_email text := 'PASTE_YOUR_ADMIN_EMAIL_HERE'; admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = lower(admin_email);
  if admin_id is null then
    raise exception 'Create the admin in Authentication > Users first, and replace the email placeholder at the end of this SQL file.';
  end if;
  insert into public.site_admins(user_id) values (admin_id) on conflict do nothing;
end;
$$;
commit;
