import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('SQLite database connected at:', dbPath);
    initializeDatabase();
  }
});

// Run queries wrapped in Promises
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

function initializeDatabase() {
  db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    // WAL improves read/write concurrency; busy_timeout makes writers wait instead of erroring
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA busy_timeout = 5000');

    // Workspaces table (boards are grouped under a workspace)
    db.run(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Boards table
    db.run(`
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        workspace_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration for DBs created before workspace_id existed.
    db.run('ALTER TABLE boards ADD COLUMN workspace_id TEXT', (err) => {
      if (err && !/duplicate column name/i.test(err.message)) {
        console.error('Migration (boards.workspace_id) failed:', err.message);
      }
    });

    // Ensure a default workspace exists and adopt any orphan boards into it,
    // so boards created before this feature keep working.
    db.run(`INSERT OR IGNORE INTO workspaces (id, name) VALUES ('ws-default', 'My Workspace')`);
    db.run(`UPDATE boards SET workspace_id = 'ws-default' WHERE workspace_id IS NULL OR workspace_id = ''`);

    // Invite links: scoped to a workspace or a single board; activate on first
    // open, then expire INVITE_TTL_HOURS later.
    db.run(`
      CREATE TABLE IF NOT EXISTS invites (
        token TEXT PRIMARY KEY,
        scope TEXT NOT NULL,
        target_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        activated_at DATETIME,
        expires_at DATETIME
      )
    `);

    // Nodes table
    db.run(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        type TEXT NOT NULL,
        position_x REAL NOT NULL,
        position_y REAL NOT NULL,
        width REAL,
        height REAL,
        parent_id TEXT,
        data TEXT NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    // Migration for databases created before parent_id existed.
    // Ignores the "duplicate column name" error on already-migrated DBs.
    db.run('ALTER TABLE nodes ADD COLUMN parent_id TEXT', (err) => {
      if (err && !/duplicate column name/i.test(err.message)) {
        console.error('Migration (nodes.parent_id) failed:', err.message);
      }
    });

    // Edges table
    db.run(`
      CREATE TABLE IF NOT EXISTS edges (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        source TEXT NOT NULL,
        target TEXT NOT NULL,
        type TEXT,
        data TEXT,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    // Comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        node_id TEXT,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        position_x REAL,
        position_y REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    console.log('SQLite schemas verified/created successfully.');
  });
}

export default db;
