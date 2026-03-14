import { Router } from 'express';
import pool from '../db.mjs';
import { authMiddleware } from '../auth.mjs';

const router = Router();
router.use(authMiddleware);

// ── GET /api/sessions ────────────────────────
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = `
      SELECT s.*, u.display_name AS host_name
      FROM sessions s
      LEFT JOIN users u ON s.host_id = u.id
      WHERE s.host_id = $1
         OR s.id IN (SELECT session_id FROM session_participants WHERE user_id = $1)
    `;
    const params = [req.user.id];

    if (type) {
      query += ` AND s.type = $2`;
      params.push(type);
    }
    query += ` ORDER BY s.start_time ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows.map(mapSession));
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/sessions ──────────────────────
router.post('/', async (req, res) => {
  try {
    const { type, title, description, startTime, scheduledDuration, roomConfig = {} } = req.body;
    if (!type || !title) return res.status(400).json({ error: 'type and title are required' });

    const result = await pool.query(
      `INSERT INTO sessions (type, title, description, host_id, start_time, scheduled_duration, room_config)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [type, title, description, req.user.id, startTime, scheduledDuration, JSON.stringify(roomConfig)]
    );
    res.status(201).json(mapSession(result.rows[0]));
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/sessions/:id ───────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.display_name AS host_name
       FROM sessions s LEFT JOIN users u ON s.host_id = u.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const participants = await pool.query(
      `SELECT sp.*, u.display_name, u.email, u.avatar_url
       FROM session_participants sp
       LEFT JOIN users u ON sp.user_id = u.id
       WHERE sp.session_id = $1`,
      [req.params.id]
    );

    const session = mapSession(result.rows[0]);
    session.participants = participants.rows.map(p => ({
      userId: p.user_id,
      displayName: p.display_name,
      email: p.email,
      avatarUrl: p.avatar_url,
      role: p.role,
      joinedAt: p.joined_at,
    }));

    res.json(session);
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /api/sessions/:id/status ────────────
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE sessions SET status = $1 WHERE id = $2 AND host_id = $3 RETURNING *`,
      [status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found or access denied' });
    res.json(mapSession(result.rows[0]));
  } catch (err) {
    console.error('Update session status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/sessions/:id/join ─────────────
router.post('/:id/join', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO session_participants (session_id, user_id, role)
       VALUES ($1, $2, 'participant')
       ON CONFLICT DO NOTHING`,
      [req.params.id, req.user.id]
    );
    res.json({ joined: true });
  } catch (err) {
    console.error('Join session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function mapSession(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    hostId: row.host_id,
    hostName: row.host_name,
    boardId: row.board_id,
    startTime: row.start_time,
    endTime: row.end_time,
    scheduledDuration: row.scheduled_duration,
    status: row.status,
    roomConfig: row.room_config,
    createdAt: row.created_at,
    participants: [],
  };
}

export default router;
