require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const DBSOURCE = process.env.DB_SOURCE || "movies.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");

    db.serialize(() => {
      console.log("Running database setup...");

      db.run(
        `CREATE TABLE IF NOT EXISTS movies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          director TEXT NOT NULL,
          year INTEGER NOT NULL
        )`,
        (err) => {
          if (err) {
            console.error("Error creating table:", err.message);
            return;
          }
          console.log('Table "movies" is ready.');

          const sql_check = "SELECT COUNT(*) as count FROM movies";
          db.get(sql_check, (err, row) => {
            if (err) {
              console.error("Error checking table count:", err.message);
              return;
            }

            if (row.count === 0) {
              console.log("Table is empty, seeding initial data...");
              const sql_insert = "INSERT INTO movies (title, director, year) VALUES (?,?,?)";

              db.run(sql_insert, ["Parasite", "Bong Joon-ho", 2019]);
              db.run(sql_insert, ["The Dark Knight", "Christopher Nolan", 2008]);
              db.run(sql_insert, ["Man of Steel", "Zack Snyder", 2013]);
              db.run(sql_insert, ["Superman Returns", "Bryan Singer", 2006]);
            }
          });
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )`,
        (err) => {
          if (err) {
            console.error("Error creating table:", err.message);
            return;
          }
          console.log('Table "users" is ready.');
        }
      );
    });
  }
});

module.exports = db;
