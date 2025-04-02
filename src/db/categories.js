const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createCategory(categoryData) {
  const { name, color, user_id } = categoryData;
  const query = `
    INSERT INTO categories (name, color, user_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [name, color, user_id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getCategoriesByUserId(userId) {
  const query = `
    SELECT * FROM categories
    WHERE user_id = $1
    ORDER BY name ASC
  `;
  const values = [userId];
  const result = await pool.query(query, values);
  return result.rows;
}

async function getCategoryById(categoryId) {
  const query = `
    SELECT * FROM categories
    WHERE id = $1
  `;
  const values = [categoryId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Category not found');
  }
  return result.rows[0];
}

async function updateCategory(categoryId, categoryData) {
  const { name, color } = categoryData;
  const query = `
    UPDATE categories
    SET name = $1, color = $2
    WHERE id = $3
    RETURNING *
  `;
  const values = [name, color, categoryId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Category not found');
  }
  return result.rows[0];
}

async function deleteCategory(categoryId) {
  const query = `
    DELETE FROM categories
    WHERE id = $1
    RETURNING *
  `;
  const values = [categoryId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Category not found');
  }
  return result.rows[0];
}

module.exports = {
  createCategory,
  getCategoriesByUserId,
  getCategoryById,
  updateCategory,
  deleteCategory
}; 