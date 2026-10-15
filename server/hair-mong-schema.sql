CREATE SCHEMA IF NOT EXISTS hair_mong;
SET search_path TO hair_mong;
 CREATE TABLE IF NOT EXISTS results (
 id TEXT PRIMARY KEY, public_token TEXT UNIQUE NOT NULL, owner_hash TEXT UNIQUE NOT NULL,
 creator_hash TEXT NOT NULL, slug TEXT NOT NULL, created_at BIGINT NOT NULL, expires_at BIGINT NOT NULL, updated_at BIGINT NOT NULL
 );
 CREATE TABLE IF NOT EXISTS votes (
 result_id TEXT NOT NULL REFERENCES results(id) ON DELETE CASCADE, voter_hash TEXT NOT NULL, slug TEXT NOT NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(result_id,voter_hash)
 );
 CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, name TEXT NOT NULL, day TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS results_expiry ON results(expires_at);
 CREATE INDEX IF NOT EXISTS events_day ON events(day);
REVOKE ALL ON SCHEMA hair_mong FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA hair_mong FROM PUBLIC;
