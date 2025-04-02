const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createEvent(eventData) {
  const { title, description, start_time, end_time, user_id, category_id, location, is_all_day } = eventData;
  const query = `
    INSERT INTO events (title, description, start_time, end_time, user_id, category_id, location, is_all_day)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [title, description, start_time, end_time, user_id, category_id, location, is_all_day];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getEventsByDateRange(userId, startDate, endDate) {
  const query = `
    SELECT * FROM events
    WHERE user_id = $1
    AND start_time >= $2
    AND end_time <= $3
    ORDER BY start_time ASC
  `;
  const values = [userId, startDate, endDate];
  const result = await pool.query(query, values);
  return result.rows;
}

async function getEventById(eventId) {
  const query = `
    SELECT * FROM events
    WHERE id = $1
  `;
  const values = [eventId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Event not found');
  }
  return result.rows[0];
}

async function updateEvent(eventId, eventData) {
  const { title, description, start_time, end_time, category_id, location, is_all_day } = eventData;
  const query = `
    UPDATE events
    SET title = $1, description = $2, start_time = $3, end_time = $4, 
        category_id = $5, location = $6, is_all_day = $7
    WHERE id = $8
    RETURNING *
  `;
  const values = [title, description, start_time, end_time, category_id, location, is_all_day, eventId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Event not found');
  }
  return result.rows[0];
}

async function deleteEvent(eventId) {
  const query = `
    DELETE FROM events
    WHERE id = $1
    RETURNING *
  `;
  const values = [eventId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Event not found');
  }
  return result.rows[0];
}

module.exports = {
  createEvent,
  getEventsByDateRange,
  getEventById,
  updateEvent,
  deleteEvent
}; 