require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createEvent, getEventsByDateRange, updateEvent, deleteEvent, getEventById } = require('../db/events');
const { createCategory, getCategoriesByUserId, updateCategory, deleteCategory, getCategoryById } = require('../db/categories');
const { createShare, getSharesByEventId, getSharedEventsByUserId, updateSharePermission, deleteShare, checkEventAccess } = require('../db/shares');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Event routes
app.post('/api/events', async (req, res) => {
  try {
    const event = await createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const events = await getEventsByDateRange(userId, new Date(startDate), new Date(endDate));
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    res.json(event);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const event = await updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Category routes
app.post('/api/categories', async (req, res) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const { userId } = req.query;
    const categories = await getCategoriesByUserId(userId);
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Share routes
app.post('/api/shares', async (req, res) => {
  try {
    const share = await createShare(req.body);
    res.status(201).json(share);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events/:id/shares', async (req, res) => {
  try {
    const shares = await getSharesByEventId(req.params.id);
    res.json(shares);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/shares', async (req, res) => {
  try {
    const { userId } = req.query;
    const sharedEvents = await getSharedEventsByUserId(userId);
    res.json(sharedEvents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/shares/:id', async (req, res) => {
  try {
    const { permissionLevel } = req.body;
    const share = await updateSharePermission(req.params.id, permissionLevel);
    res.json(share);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/shares/:id', async (req, res) => {
  try {
    await deleteShare(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle database connection errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ 
      error: 'Database connection failed',
      message: process.env.NODE_ENV === 'production' 
        ? 'Service temporarily unavailable' 
        : err.message 
    });
  }

  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// Add a catch-all route for the frontend
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 