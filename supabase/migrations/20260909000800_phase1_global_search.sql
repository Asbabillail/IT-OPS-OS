begin;

-- ============================================================
-- Global search projection
--
-- search_documents is a DERIVED projection, not a source of truth.
--
-- Source records remain authoritative in their domain tables.
-- Search rows may therefore be rebuilt, updated or deleted.
--
-- Search goals:
--   - exact record/code/serial lookup
--   - prefix / partial text search
--   - PostgreSQL full-text search
--   - entity-type filtering
-- ============================================================

create extension if not exists pg_trgm;


create table if not exists public.search_documents (
  id uuid primary key default gen_random_uuid(),

  entity_type text not null,
  entity_id uuid not null,

  canonical_key text not null,

  title text not null,
  subtitle text,
  search_text text not null,

  source_updated_at timestamptz,
  indexed_at timestamptz not null default now(),

  search_vector tsvector generated always as (
    setweight(
      to_tsvector('simple', coalesce(canonical_key, '')),
      'A'
    )
    ||
    setweight(
      to_tsvector('simple', coalesce(title, '')),
      'A'
    )
    ||
    setweight(
      to_tsvector('simple', coalesce(subtitle, '')),
      'B'
    )
    ||
    setweight(
      to_tsvector('simple', coalesce(search_text, '')),
      'C'
    )
  ) stored,

  constraint search_documents_entity_type_valid
    check (
      entity_type in (
        'Student',
        'Faculty',
        'Device',
        'Distribution',
        'BYOD',
        'Repair',
        'AppleCare',
        'Return',
        'Release',
        'Document'
      )
    ),

  constraint search_documents_canonical_key_not_blank
    check (btrim(canonical_key) <> ''),

  constraint search_documents_title_not_blank
    check (btrim(title) <> ''),

  constraint search_documents_search_text_not_blank
    check (btrim(search_text) <> ''),

  constraint search_documents_entity_key
    unique (entity_type, entity_id)
);


-- ============================================================
-- Exact / normalized lookup
-- ============================================================

create index if not exists search_documents_canonical_key_ci_idx
  on public.search_documents (lower(canonical_key));

create index if not exists search_documents_entity_type_idx
  on public.search_documents (entity_type);


-- ============================================================
-- Prefix / fuzzy lookup
--
-- pg_trgm substantially improves partial searches such as:
--   serial fragments
--   student/faculty names
--   asset tags
--   workflow codes
-- ============================================================

create index if not exists search_documents_canonical_key_trgm_idx
  on public.search_documents
  using gin (canonical_key gin_trgm_ops);

create index if not exists search_documents_title_trgm_idx
  on public.search_documents
  using gin (title gin_trgm_ops);

create index if not exists search_documents_search_text_trgm_idx
  on public.search_documents
  using gin (search_text gin_trgm_ops);


-- ============================================================
-- Full-text lookup
-- ============================================================

create index if not exists search_documents_vector_idx
  on public.search_documents
  using gin (search_vector);


-- ============================================================
-- Search projection freshness
-- ============================================================

create index if not exists search_documents_indexed_at_idx
  on public.search_documents (indexed_at desc);


-- ============================================================
-- Search function
--
-- Security model:
--   - SECURITY INVOKER
--   - no privilege escalation
--   - underlying RLS remains authoritative
--
-- Exact canonical-key matches rank highest, then prefix and
-- full-text/fuzzy matches.
-- ============================================================

create or replace function public.search_phase1(
  query_text text,
  entity_types text[] default null,
  result_limit integer default 25
)
returns table (
  entity_type text,
  entity_id uuid,
  canonical_key text,
  title text,
  subtitle text,
  rank real
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    d.entity_type,
    d.entity_id,
    d.canonical_key,
    d.title,
    d.subtitle,
    (
      case
        when lower(d.canonical_key) = lower(btrim(query_text))
          then 1000.0
        when lower(d.canonical_key) like lower(btrim(query_text)) || '%'
          then 500.0
        else 0.0
      end
      +
      ts_rank(
        d.search_vector,
        plainto_tsquery('simple', btrim(query_text))
      ) * 100.0
      +
      greatest(
        public.similarity(lower(d.canonical_key), lower(btrim(query_text))),
        public.similarity(lower(d.title), lower(btrim(query_text))),
        public.similarity(lower(d.search_text), lower(btrim(query_text)))
      ) * 10.0
    )::real as rank
  from public.search_documents d
  where
    btrim(query_text) <> ''
    and (
      entity_types is null
      or d.entity_type = any(entity_types)
    )
    and (
      lower(d.canonical_key) = lower(btrim(query_text))
      or lower(d.canonical_key) like lower(btrim(query_text)) || '%'
      or d.search_vector @@ plainto_tsquery('simple', btrim(query_text))
      or public.similarity(
        lower(d.canonical_key),
        lower(btrim(query_text))
      ) > 0.2
      or public.similarity(
        lower(d.title),
        lower(btrim(query_text))
      ) > 0.2
      or public.similarity(
        lower(d.search_text),
        lower(btrim(query_text))
      ) > 0.2
    )
  order by rank desc, d.canonical_key
  limit least(greatest(result_limit, 1), 100);
$$;


-- ============================================================
-- Row Level Security
--
-- Search projection must not become an authorization bypass.
-- Until pilot/server access is introduced, remain fail-closed.
-- ============================================================

alter table public.search_documents enable row level security;
alter table public.search_documents force row level security;

drop policy if exists search_documents_fail_closed
  on public.search_documents;

create policy search_documents_fail_closed
on public.search_documents
for all
to public
using (false)
with check (false);

commit;
