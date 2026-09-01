-- First-party acquisition telemetry.
--
-- Columns are the redacted record from functions/api/event.js, field for
-- field. That record is already a privacy allowlist, so this table inherits
-- the property that matters: there is no column here that could hold an email
-- address or a precise location, because there is no such field upstream.
--
-- No UNIQUE constraint and no dedupe. A repeated page_view is a real repeated
-- page_view, and collapsing them here would silently answer a question the
-- analysis has not asked yet.
CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ev            TEXT NOT NULL,   -- closed vocabulary, validated at the edge
  at            TEXT NOT NULL,   -- ISO 8601
  path          TEXT,
  label         TEXT,
  state         TEXT,
  landing       TEXT,
  referrer      TEXT,
  source        TEXT NOT NULL,
  evidence      TEXT NOT NULL,   -- OBSERVED or UNKNOWN, never collapsed
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  country       TEXT
);

-- Every question anyone asks of this table is bounded by time, so time leads
-- both indexes. Funnel counts filter by event name inside a window.
CREATE INDEX IF NOT EXISTS idx_events_at ON events (at DESC);
CREATE INDEX IF NOT EXISTS idx_events_ev_at ON events (ev, at DESC);

-- "Where did the traffic come from" is the whole reason this sink exists.
CREATE INDEX IF NOT EXISTS idx_events_source_at ON events (source, at DESC);
