-- Calendly bookings arrive as leads (kind BOOKING_SCHEDULED) carrying the
-- event and invitee URIs instead of an email address. The unique index is the
-- dedupe: one Calendly event is one lead, however many tabs report it.
ALTER TABLE leads ADD COLUMN kind TEXT;
ALTER TABLE leads ADD COLUMN event_uri TEXT;
ALTER TABLE leads ADD COLUMN invitee_uri TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_event_uri ON leads(event_uri) WHERE event_uri IS NOT NULL;

-- One row per POST /api/lead, keyed by a hash of the IP (never the IP), kept
-- only as long as the 10 minute window that reads it.
CREATE TABLE IF NOT EXISTS lead_posts (
  ip_hash TEXT NOT NULL,
  at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lead_posts_ip_at ON lead_posts(ip_hash, at);
