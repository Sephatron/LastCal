const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createShare(shareData) {
  const { event_id, user_id, permission } = shareData;
  const query = `
    INSERT INTO event_shares (event_id, user_id, permission)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [event_id, user_id, permission];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getSharesByEventId(eventId) {
  const query = `
    SELECT * FROM event_shares
    WHERE event_id = $1
  `;
  const values = [eventId];
  const result = await pool.query(query, values);
  return result.rows;
}

async function getSharedEventsByUserId(userId) {
  const query = `
    SELECT e.*, es.permission
    FROM events e
    JOIN event_shares es ON e.id = es.event_id
    WHERE es.user_id = $1
  `;
  const values = [userId];
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateSharePermission(shareId, permission) {
  const query = `
    UPDATE event_shares
    SET permission = $1
    WHERE id = $2
    RETURNING *
  `;
  const values = [permission, shareId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Share not found');
  }
  return result.rows[0];
}

async function deleteShare(shareId) {
  const query = `
    DELETE FROM event_shares
    WHERE id = $1
    RETURNING *
  `;
  const values = [shareId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Share not found');
  }
  return result.rows[0];
}

async function checkEventAccess(eventId, userId) {
  const query = `
    SELECT e.*, es.permission
    FROM events e
    LEFT JOIN event_shares es ON e.id = es.event_id AND es.user_id = $1
    WHERE e.id = $2
  `;
  const values = [userId, eventId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Event not found');
  }
  return result.rows[0];
}

module.exports = {
  createShare,
  getSharesByEventId,
  getSharedEventsByUserId,
  updateSharePermission,
  deleteShare,
  checkEventAccess
}; 