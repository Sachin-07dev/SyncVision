import { Router } from 'express';
import { randomUUID } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import pool from '../db.mjs';
import { authMiddleware } from '../auth.mjs';

const router = Router();
const DEV_BOARDS_FILE = new URL('../.dev-boards.json', import.meta.url);

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

function isOwnerForeignKeyError(error) {
  return String(error?.code || '') === '23503' && String(error?.constraint || '') === 'boards_owner_id_fkey';
}

async function readDevBoards() {
  try {
    const raw = await readFile(DEV_BOARDS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeDevBoards(boards) {
  await writeFile(DEV_BOARDS_FILE, JSON.stringify(boards, null, 2), 'utf-8');
}

// All board routes require auth
router.use(authMiddleware);

// ── GET /api/boards ─── list user's boards ───
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.display_name AS owner_name
       FROM boards b
       LEFT JOIN users u ON b.owner_id = u.id
       WHERE b.owner_id = $1
          OR b.id IN (SELECT board_id FROM board_collaborators WHERE user_id = $1)
       ORDER BY b.updated_at DESC`,
      [req.user.id]
    );

    const dbBoards = result.rows.map(mapBoard);
    let devBoards = [];
    try {
      devBoards = (await readDevBoards())
        .filter((board) => board.owner_id === req.user.id || board.is_public)
        .map(mapBoard);
    } catch {
      devBoards = [];
    }

    const merged = new Map();
    for (const board of [...dbBoards, ...devBoards]) {
      merged.set(board.id, board);
    }

    const sorted = Array.from(merged.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    res.json(sorted);
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      try {
        const boards = await readDevBoards();
        const visibleBoards = boards
          .filter((board) => board.owner_id === req.user.id || board.is_public)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        return res.json(visibleBoards.map(mapBoard));
      } catch (fallbackErr) {
        console.error('List boards fallback error:', fallbackErr);
      }
    }

    console.error('List boards error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/boards ─── create board ────────
router.post('/', async (req, res) => {
  try {
    const { name, type = 'whiteboard', data = {}, isPublic = false } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const result = await pool.query(
      `INSERT INTO boards (name, type, owner_id, data, is_public)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, type, req.user.id, JSON.stringify(data), isPublic]
    );
    res.status(201).json(mapBoard(result.rows[0]));
  } catch (err) {
    if (isDatabaseConnectivityError(err) || isOwnerForeignKeyError(err)) {
      try {
        const { name, type = 'whiteboard', data = {}, isPublic = false } = req.body;
        const boards = await readDevBoards();
        const now = new Date().toISOString();
        const board = {
          id: randomUUID(),
          name,
          type,
          owner_id: req.user.id,
          owner_name: req.user.displayName,
          data,
          is_public: Boolean(isPublic),
          created_at: now,
          updated_at: now,
        };

        boards.push(board);
        await writeDevBoards(boards);
        return res.status(201).json(mapBoard(board));
      } catch (fallbackErr) {
        console.error('Create board fallback error:', fallbackErr);
      }
    }

    console.error('Create board error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/boards/:id ─── get board ────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM boards WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      const devBoards = await readDevBoards();
      const devBoard = devBoards.find((b) => b.id === req.params.id);
      if (!devBoard) return res.status(404).json({ error: 'Board not found' });

      if (devBoard.owner_id !== req.user.id && !devBoard.is_public) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.json(mapBoard(devBoard));
    }

    const board = result.rows[0];
    // Check access
    if (board.owner_id !== req.user.id && !board.is_public) {
      const collab = await pool.query(
        'SELECT 1 FROM board_collaborators WHERE board_id = $1 AND user_id = $2',
        [board.id, req.user.id]
      );
      if (collab.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(mapBoard(board));
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      try {
        const boards = await readDevBoards();
        const board = boards.find((b) => b.id === req.params.id);
        if (!board) return res.status(404).json({ error: 'Board not found' });

        if (board.owner_id !== req.user.id && !board.is_public) {
          return res.status(403).json({ error: 'Access denied' });
        }

        return res.json(mapBoard(board));
      } catch (fallbackErr) {
        console.error('Get board fallback error:', fallbackErr);
      }
    }

    console.error('Get board error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /api/boards/:id ─── update board ─────
router.put('/:id', async (req, res) => {
  try {
    const { name, data, isPublic } = req.body;
    const result = await pool.query(
      `UPDATE boards SET
        name       = COALESCE($1, name),
        data       = COALESCE($2, data),
        is_public  = COALESCE($3, is_public),
        updated_at = NOW()
       WHERE id = $4 AND owner_id = $5
       RETURNING *`,
      [name, data ? JSON.stringify(data) : null, isPublic, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      const devBoards = await readDevBoards();
      const board = devBoards.find((b) => b.id === req.params.id && b.owner_id === req.user.id);
      if (!board) return res.status(404).json({ error: 'Board not found or access denied' });

      if (name !== undefined) board.name = name;
      if (data !== undefined) board.data = data;
      if (isPublic !== undefined) board.is_public = Boolean(isPublic);
      board.updated_at = new Date().toISOString();

      await writeDevBoards(devBoards);
      return res.json(mapBoard(board));
    }
    res.json(mapBoard(result.rows[0]));
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      try {
        const { name, data, isPublic } = req.body;
        const boards = await readDevBoards();
        const board = boards.find((b) => b.id === req.params.id && b.owner_id === req.user.id);
        if (!board) return res.status(404).json({ error: 'Board not found or access denied' });

        if (name !== undefined) board.name = name;
        if (data !== undefined) board.data = data;
        if (isPublic !== undefined) board.is_public = Boolean(isPublic);
        board.updated_at = new Date().toISOString();

        await writeDevBoards(boards);
        return res.json(mapBoard(board));
      } catch (fallbackErr) {
        console.error('Update board fallback error:', fallbackErr);
      }
    }

    console.error('Update board error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /api/boards/:id ───────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM boards WHERE id = $1 AND owner_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      const devBoards = await readDevBoards();
      const index = devBoards.findIndex((b) => b.id === req.params.id && b.owner_id === req.user.id);
      if (index === -1) return res.status(404).json({ error: 'Board not found or access denied' });

      devBoards.splice(index, 1);
      await writeDevBoards(devBoards);
      return res.json({ deleted: true });
    }
    res.json({ deleted: true });
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      try {
        const boards = await readDevBoards();
        const index = boards.findIndex((b) => b.id === req.params.id && b.owner_id === req.user.id);
        if (index === -1) return res.status(404).json({ error: 'Board not found or access denied' });

        boards.splice(index, 1);
        await writeDevBoards(boards);
        return res.json({ deleted: true });
      } catch (fallbackErr) {
        console.error('Delete board fallback error:', fallbackErr);
      }
    }

    console.error('Delete board error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/boards/:id/collaborators ───────
router.post('/:id/collaborators', async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body;
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    await pool.query(
      `INSERT INTO board_collaborators (board_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (board_id, user_id) DO UPDATE SET role = $3`,
      [req.params.id, userResult.rows[0].id, role]
    );
    res.json({ success: true });
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      return res.status(501).json({ error: 'Collaborator management requires database connectivity' });
    }

    console.error('Add collaborator error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function mapBoard(row) {
  let parsedData = row.data;
  if (typeof parsedData === 'string') {
    try {
      parsedData = JSON.parse(parsedData);
    } catch {
      parsedData = {};
    }
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    data: parsedData || {},
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default router;
