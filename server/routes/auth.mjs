import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import pool from '../db.mjs';
import { signToken, authMiddleware } from '../auth.mjs';

const router = Router();
const DEV_USERS_FILE = new URL('../.dev-users.json', import.meta.url);

const DEFAULT_PREFERENCES = {
  theme: 'dark',
  notifications: true,
  soundEffects: true,
  compactMode: false,
};

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function mapUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url || undefined,
    role: row.role,
    orgId: row.org_id || undefined,
    timezone: row.timezone,
    locale: row.locale,
    createdAt: row.created_at,
    lastActiveAt: row.last_active_at,
    preferences: row.preferences,
  };
}

function findDevUserByEmail(users, email) {
  const normalized = normalizeEmail(email);
  return users.find((u) => normalizeEmail(u.email) === normalized);
}

function getPasswordHash(user) {
  return user?.password_hash || user?.passwordHash || null;
}

async function verifyUserPassword(user, password) {
  const passwordHash = getPasswordHash(user);
  if (!passwordHash || !password) return false;
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
}

async function readDevUsers() {
  try {
    const raw = await readFile(DEV_USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeDevUsers(users) {
  await writeFile(DEV_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function isDatabaseConnectivityError(error) {
  if (!error) return false;

  const codes = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', '57P03', '3D000']);
  if (codes.has(String(error.code || '').toUpperCase())) {
    return true;
  }

  if (Array.isArray(error.errors)) {
    for (const nestedError of error.errors) {
      if (codes.has(String(nestedError?.code || '').toUpperCase())) {
        return true;
      }
    }
  }

  const message = String(error.message || '').toLowerCase();
  return (
    message.includes('connect') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('database') ||
    message.includes('no pg_hba')
  );
}

// ── POST /api/auth/signup ────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { password, displayName, role = 'student', customRoleName } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'email, password, and displayName are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const validRoles = ['student', 'teacher', 'interviewer', 'org_admin', 'other'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    if (role === 'other' && (!customRoleName || !customRoleName.trim())) {
      return res.status(400).json({ error: 'customRoleName is required when role is other' });
    }

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name, role, timezone, locale)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, display_name, role, timezone, locale, created_at, last_active_at, preferences`,
      [email, passwordHash, displayName, role, 'UTC', 'en-US']
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({ token, user: mapUserRow(user) });
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      try {
        const { password, displayName, role = 'student' } = req.body;
        const email = normalizeEmail(req.body.email);
        const users = await readDevUsers();

        if (findDevUserByEmail(users, email)) {
          return res.status(409).json({ error: 'Email already registered' });
        }

        const now = new Date().toISOString();
        const passwordHash = await bcrypt.hash(password, 12);
        const user = {
          id: randomUUID(),
          email,
          password_hash: passwordHash,
          display_name: displayName,
          avatar_url: null,
          role,
          org_id: null,
          timezone: 'UTC',
          locale: 'en-US',
          created_at: now,
          last_active_at: now,
          preferences: DEFAULT_PREFERENCES,
        };

        users.push(user);
        await writeDevUsers(users);

        const token = signToken({ id: user.id, email: user.email, role: user.role });
        return res.status(201).json({ token, user: mapUserRow(user) });
      } catch (fallbackErr) {
        console.error('Signup fallback error:', fallbackErr);
      }
    }

    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/login ─────────────────────
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email || req.body.username);

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, display_name, avatar_url, role, org_id,
              timezone, locale, created_at, last_active_at, preferences
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      const users = await readDevUsers();
      const fallbackUser = findDevUserByEmail(users, email);

      if (!fallbackUser) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const fallbackValid = await verifyUserPassword(fallbackUser, password);
      if (!fallbackValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      fallbackUser.last_active_at = new Date().toISOString();
      await writeDevUsers(users);

      const token = signToken({ id: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role });
      return res.json({ token, user: mapUserRow(fallbackUser) });
    }

    const row = result.rows[0];
    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    await pool.query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [row.id]);

    const token = signToken({ id: row.id, email: row.email, role: row.role });

    res.json({ token, user: mapUserRow(row) });
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      try {
        const { password } = req.body;
        const email = normalizeEmail(req.body.email);
        const users = await readDevUsers();
        const user = findDevUserByEmail(users, email);

        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const valid = await verifyUserPassword(user, password);
        if (!valid) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        user.last_active_at = new Date().toISOString();
        await writeDevUsers(users);

        const token = signToken({ id: user.id, email: user.email, role: user.role });
        return res.json({ token, user: mapUserRow(user) });
      } catch (fallbackErr) {
        console.error('Login fallback error:', fallbackErr);
      }
    }

    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/auth/me ─────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, display_name, avatar_url, role, org_id,
              timezone, locale, created_at, last_active_at, preferences
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      const users = await readDevUsers();
      const user = users.find((u) => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(mapUserRow(user));
    }

    const row = result.rows[0];
    res.json(mapUserRow(row));
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      try {
        const users = await readDevUsers();
        const user = users.find((u) => u.id === req.user.id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.json(mapUserRow(user));
      } catch (fallbackErr) {
        console.error('Me fallback error:', fallbackErr);
      }
    }

    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
