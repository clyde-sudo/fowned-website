-- Durable home for the FOWNED_LEAD record.
--
-- The column list is the §10 contract from functions/api/lead.js, field for
-- field and in the same order. That is deliberate: when the shape changes, the
-- diff here and the diff there should be the same diff, so a field cannot be
-- added to one and quietly forgotten in the other.
--
-- Everything except id/CONTACT/STATUS/TIMESTAMP is nullable, because the
-- handler already decided that a field nobody supplied is null rather than an
-- invented default, and a NOT NULL here would turn that honest null into a
-- write failure.
CREATE TABLE IF NOT EXISTS leads (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  domain              TEXT,
  company             TEXT,
  contact             TEXT    NOT NULL,
  contact_name        TEXT,
  message             TEXT,
  source              TEXT,
  landing_page        TEXT,
  audit_completed     INTEGER NOT NULL DEFAULT 0,
  key_audit_findings  TEXT,             -- JSON array, max 6 entries
  booking_click       INTEGER NOT NULL DEFAULT 0,
  owner               TEXT    NOT NULL DEFAULT 'UNASSIGNED',
  status              TEXT    NOT NULL DEFAULT 'NEW',
  timestamp           TEXT    NOT NULL, -- ISO 8601, set by the handler
  notified            INTEGER NOT NULL DEFAULT 0,  -- did the email go out
  notify_error        TEXT              -- why it did not, when it did not
);

-- Sales reads this table newest-first and by owner. Nothing else queries it.
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_leads_owner_status ON leads (owner, status);

-- A lead nobody was told about is the failure this whole table exists to make
-- visible. It must be one query away, not a scan someone has to think to run.
CREATE INDEX IF NOT EXISTS idx_leads_unnotified ON leads (notified) WHERE notified = 0;
