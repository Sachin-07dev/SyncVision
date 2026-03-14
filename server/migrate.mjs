import pool from './db.mjs';

export async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name  VARCHAR(255) NOT NULL,
        avatar_url    TEXT,
        role          VARCHAR(50) NOT NULL DEFAULT 'student',
        org_id        UUID,
        timezone      VARCHAR(100) DEFAULT 'UTC',
        locale        VARCHAR(20) DEFAULT 'en-US',
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        last_active_at TIMESTAMPTZ DEFAULT NOW(),
        preferences   JSONB DEFAULT '{"theme":"dark","notifications":true,"soundEffects":true,"compactMode":false}'
      );

      CREATE TABLE IF NOT EXISTS boards (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(255) NOT NULL,
        type          VARCHAR(50) DEFAULT 'whiteboard',
        owner_id      UUID REFERENCES users(id) ON DELETE CASCADE,
        data          JSONB DEFAULT '{}',
        is_public     BOOLEAN DEFAULT false,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS board_collaborators (
        board_id      UUID REFERENCES boards(id) ON DELETE CASCADE,
        user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
        role          VARCHAR(50) DEFAULT 'editor',
        PRIMARY KEY (board_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type            VARCHAR(50) NOT NULL,
        title           VARCHAR(255) NOT NULL,
        description     TEXT,
        host_id         UUID REFERENCES users(id) ON DELETE CASCADE,
        board_id        UUID REFERENCES boards(id) ON DELETE SET NULL,
        start_time      TIMESTAMPTZ,
        end_time        TIMESTAMPTZ,
        scheduled_duration INTEGER,
        status          VARCHAR(50) DEFAULT 'scheduled',
        room_config     JSONB DEFAULT '{}',
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS session_participants (
        session_id    UUID REFERENCES sessions(id) ON DELETE CASCADE,
        user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
        role          VARCHAR(50) DEFAULT 'participant',
        joined_at     TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (session_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
        type          VARCHAR(100) NOT NULL,
        title         VARCHAR(255) NOT NULL,
        message       TEXT,
        is_read       BOOLEAN DEFAULT false,
        action_url    TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Database migrations complete');
  } finally {
    client.release();
  }
}
