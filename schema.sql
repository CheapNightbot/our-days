-- emojis table (reference data)
CREATE TABLE IF NOT EXISTS emojis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emoji TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- reactions table (the actual data)
CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,          -- "YYYY-MM-DD"
    emoji_id INTEGER NOT NULL,   -- FK to emojis.id
    token_hash TEXT NOT NULL,    -- Hashed anonymous token (for rate limiting)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, token_hash),    -- One reaction per token per day
    FOREIGN KEY (emoji_id) REFERENCES emojis(id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_reactions_date ON reactions(date);
CREATE INDEX IF NOT EXISTS idx_reactions_token ON reactions(token_hash);

-- Seed the emoji reference data
INSERT OR IGNORE INTO emojis (emoji, name) VALUES
    ('😄', 'happy'),
    ('😭', 'sad'),
    ('😡', 'angry'),
    ('😖', 'frustrated'),
    ('😴', 'tired'),
    ('🤩', 'excited');
