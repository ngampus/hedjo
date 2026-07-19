-- Hedjo D1 Schema
-- Cloudflare Workers SQLite database

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  base_currency TEXT NOT NULL DEFAULT 'IDR',
  baseline_year INTEGER NOT NULL DEFAULT 2025,
  owner_user_id TEXT NOT NULL,
  website_url TEXT DEFAULT '',
  estimated_rating TEXT DEFAULT '',
  estimated_footprint_range TEXT DEFAULT '',
  estimation_reason TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  user_email TEXT DEFAULT '',
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reporting_periods (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  locked_at TEXT DEFAULT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  reporting_period_id TEXT NOT NULL,
  scope INTEGER NOT NULL,
  category_id TEXT NOT NULL,
  location TEXT DEFAULT '',
  activity_amount REAL NOT NULL DEFAULT 0,
  activity_unit TEXT DEFAULT '',
  emission_factor_id TEXT DEFAULT '',
  calculated_co2e REAL NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  date TEXT DEFAULT '',
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (reporting_period_id) REFERENCES reporting_periods(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  reporting_period_id TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  model_name TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (reporting_period_id) REFERENCES reporting_periods(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_org_owner ON organizations(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_periods_org ON reporting_periods(org_id);
CREATE INDEX IF NOT EXISTS idx_activities_period ON activities(reporting_period_id);
CREATE INDEX IF NOT EXISTS idx_insights_period ON insights(reporting_period_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
