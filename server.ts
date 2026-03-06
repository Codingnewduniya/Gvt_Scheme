import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("civic.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    category TEXT,
    description TEXT,
    latitude REAL,
    longitude REAL,
    address TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS assignments (
    report_id INTEGER,
    department_id INTEGER,
    officer_id TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(report_id, department_id),
    FOREIGN KEY(report_id) REFERENCES reports(id),
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );
`);

// Seed Departments
const seedDeps = ["Roads", "Water", "Sanitation", "Electricity", "Public Works"];
const insertDep = db.prepare("INSERT OR IGNORE INTO departments (name) VALUES (?)");
seedDeps.forEach(dep => insertDep.run(dep));

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Auth API
  app.post("/api/auth/otp-request", (req, res) => {
    const { phone_number } = req.body;
    // In a real app, send OTP via SMS. Here we just simulate.
    res.json({ message: "OTP sent to " + phone_number, otp: "123456" });
  });

  app.post("/api/auth/login", (req, res) => {
    const { phone_number, otp } = req.body;
    if (otp === "123456") {
      let user = db.prepare("SELECT * FROM users WHERE phone_number = ?").get(phone_number);
      if (!user) {
        const result = db.prepare("INSERT INTO users (phone_number) VALUES (?)").run(phone_number);
        user = { id: result.lastInsertRowid, phone_number };
      }
      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: "Invalid OTP" });
    }
  });

  // Reports API
  app.post("/api/reports", (req, res) => {
    const { user_id, category, description, latitude, longitude, address, image_url } = req.body;
    const result = db.prepare(`
      INSERT INTO reports (user_id, category, description, latitude, longitude, address, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, category, description, latitude, longitude, address, image_url);
    res.json({ success: true, report_id: result.lastInsertRowid });
  });

  app.get("/api/reports", (req, res) => {
    const { user_id } = req.query;
    let reports;
    if (user_id) {
      reports = db.prepare("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC").all(user_id);
    } else {
      reports = db.prepare(`
        SELECT r.*, d.name as department_name 
        FROM reports r
        LEFT JOIN assignments a ON r.id = a.report_id
        LEFT JOIN departments d ON a.department_id = d.id
        ORDER BY r.created_at DESC
      `).all();
    }
    res.json(reports);
  });

  app.patch("/api/reports/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/reports/:id/assign", (req, res) => {
    const { department_id } = req.body;
    db.prepare("INSERT OR REPLACE INTO assignments (report_id, department_id) VALUES (?, ?)").run(req.params.id, department_id);
    res.json({ success: true });
  });

  // Departments API
  app.get("/api/departments", (req, res) => {
    const deps = db.prepare("SELECT * FROM departments").all();
    res.json(deps);
  });

  // Analytics API
  app.get("/api/analytics", (req, res) => {
    const stats = {
      total: db.prepare("SELECT COUNT(*) as count FROM reports").get().count,
      resolved: db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'Resolved'").get().count,
      pending: db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'Pending'").get().count,
      byCategory: db.prepare("SELECT category, COUNT(*) as count FROM reports GROUP BY category").all(),
      byStatus: db.prepare("SELECT status, COUNT(*) as count FROM reports GROUP BY status").all()
    };
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
