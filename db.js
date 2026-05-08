const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'resume.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database', err);
  }
});

const initSql = `
CREATE TABLE IF NOT EXISTS resume (
  id INTEGER PRIMARY KEY,
  fullName TEXT,
  jobTitle TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  summary TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  certs TEXT,
  updated_at TEXT
);
`;

db.serialize(() => {
  db.run(initSql);
});

function saveResume(data) {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    const query = `REPLACE INTO resume (
      id, fullName, jobTitle, email, phone, location, website, summary, skills, experience, education, certs, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      1,
      data.fullName || '',
      data.jobTitle || '',
      data.email || '',
      data.phone || '',
      data.location || '',
      data.website || '',
      data.summary || '',
      data.skills || '',
      JSON.stringify(data.experience || []),
      JSON.stringify(data.education || []),
      JSON.stringify(data.certs || []),
      now
    ];

    db.run(query, values, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

function getResume() {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM resume WHERE id = 1', [], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve({
        fullName: row.fullName,
        jobTitle: row.jobTitle,
        email: row.email,
        phone: row.phone,
        location: row.location,
        website: row.website,
        summary: row.summary,
        skills: row.skills,
        experience: JSON.parse(row.experience || '[]'),
        education: JSON.parse(row.education || '[]'),
        certs: JSON.parse(row.certs || '[]'),
        updated_at: row.updated_at
      });
    });
  });
}

module.exports = { saveResume, getResume };