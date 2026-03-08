import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('tasks.db', { verbose: console.log });

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'missed'
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/tasks', (req, res) => {
    try {
      const tasks = db.prepare('SELECT * FROM tasks ORDER BY date ASC, time ASC').all();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', (req, res) => {
    const { id, title, description, date, time } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO tasks (id, title, description, date, time) VALUES (?, ?, ?, ?, ?)');
      stmt.run(id, title, description, date, time);
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, date, time, status } = req.body;
    try {
      const stmt = db.prepare('UPDATE tasks SET title = ?, description = ?, date = ?, time = ?, status = ? WHERE id = ?');
      stmt.run(title, description, date, time, status, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.put('/api/tasks/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
      stmt.run(status, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task status' });
    }
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
