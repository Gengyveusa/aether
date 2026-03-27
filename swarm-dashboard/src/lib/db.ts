import Database from "better-sqlite3";
import path from "path";
import type { SwarmArtifact } from "./swarm-data";

const DB_PATH = path.join(process.cwd(), "swarm.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(`
      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        type TEXT NOT NULL,
        target_folder TEXT NOT NULL,
        title TEXT NOT NULL,
        relevance_score INTEGER NOT NULL DEFAULT 3,
        architecture_alignment TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'validating',
        timestamp TEXT NOT NULL,
        cancer_signature TEXT NOT NULL DEFAULT '',
        aging_signature TEXT NOT NULL DEFAULT '',
        raw_yaml TEXT,
        source_channel TEXT NOT NULL DEFAULT 'manual',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'offline',
        mission TEXT NOT NULL DEFAULT '',
        targets TEXT NOT NULL DEFAULT '[]',
        constraints TEXT NOT NULL DEFAULT '',
        artifacts_produced INTEGER NOT NULL DEFAULT 0,
        last_activity TEXT,
        uptime_hours REAL NOT NULL DEFAULT 0,
        queries_completed INTEGER NOT NULL DEFAULT 0,
        total_queries INTEGER NOT NULL DEFAULT 0,
        evidence_score REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        level TEXT NOT NULL DEFAULT 'info',
        agent_id TEXT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }
  return _db;
}

// ── Artifact operations ──

export function insertArtifact(artifact: SwarmArtifact & { rawYaml?: string; sourceChannel?: string }): SwarmArtifact {
  const db = getDb();
  db.prepare(`
    INSERT INTO artifacts (id, agent_id, type, target_folder, title, relevance_score, architecture_alignment, status, timestamp, cancer_signature, aging_signature, raw_yaml, source_channel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    artifact.id,
    artifact.agentId,
    artifact.type,
    artifact.targetFolder,
    artifact.title,
    artifact.relevanceScore,
    JSON.stringify(artifact.architectureAlignment),
    artifact.status,
    artifact.timestamp,
    artifact.cancerSignature,
    artifact.agingSignature,
    artifact.rawYaml || null,
    artifact.sourceChannel || "manual",
  );
  return artifact;
}

export function getAllArtifacts(filters?: { type?: string; status?: string; agentId?: string }): SwarmArtifact[] {
  const db = getDb();
  let sql = "SELECT * FROM artifacts";
  const conditions: string[] = [];
  const params: string[] = [];

  if (filters?.type && filters.type !== "all") {
    conditions.push("type = ?");
    params.push(filters.type);
  }
  if (filters?.status && filters.status !== "all") {
    conditions.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.agentId) {
    conditions.push("agent_id = ?");
    params.push(filters.agentId);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY timestamp DESC";

  const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>;
  return rows.map(rowToArtifact);
}

export function getArtifactCount(): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM artifacts").get() as { count: number };
  return row.count;
}

export function updateArtifactStatus(id: string, status: SwarmArtifact["status"]): boolean {
  const db = getDb();
  const result = db.prepare("UPDATE artifacts SET status = ? WHERE id = ?").run(status, id);
  return result.changes > 0;
}

function rowToArtifact(row: Record<string, unknown>): SwarmArtifact {
  return {
    id: row.id as string,
    agentId: row.agent_id as string,
    type: row.type as SwarmArtifact["type"],
    targetFolder: row.target_folder as string,
    title: row.title as string,
    relevanceScore: row.relevance_score as number,
    architectureAlignment: JSON.parse(row.architecture_alignment as string),
    status: row.status as SwarmArtifact["status"],
    timestamp: row.timestamp as string,
    cancerSignature: row.cancer_signature as string,
    agingSignature: row.aging_signature as string,
  };
}

// ── Activity log ──

export function addLogEntry(message: string, level: string = "info", agentId?: string): void {
  const db = getDb();
  db.prepare("INSERT INTO activity_log (message, level, agent_id) VALUES (?, ?, ?)").run(message, level, agentId || null);
}

export function getRecentLogs(limit: number = 50): Array<{ message: string; level: string; agentId: string | null; timestamp: string }> {
  const db = getDb();
  const rows = db.prepare("SELECT message, level, agent_id, timestamp FROM activity_log ORDER BY id DESC LIMIT ?").all(limit) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    message: r.message as string,
    level: r.level as string,
    agentId: r.agent_id as string | null,
    timestamp: r.timestamp as string,
  }));
}

// ── Seed DB with initial data if empty ──

export function seedIfEmpty(artifacts: SwarmArtifact[]): void {
  const count = getArtifactCount();
  if (count === 0) {
    for (const artifact of artifacts) {
      insertArtifact({ ...artifact, sourceChannel: "seed" });
    }
    addLogEntry("Database seeded with initial artifact data", "system");
  }
}
