DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS week_records;
DROP TABLE IF EXISTS month_records;
DROP TABLE IF EXISTS focuses_month;
DROP TABLE IF EXISTS tracker;
DROP TABLE IF EXISTS login;

CREATE TABLE week_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record VARCHAR NOT NULL,
    time_record VARCHAR NOT NULL,
    day_record INTEGER NOT NULL,
    month_record INTEGER NOT NULL,
    year_record INTEGER NOT NULL,
    user_id INTEGER NOT NULL
);

CREATE TABLE month_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record VARCHAR NOT NULL,
    day_record INTEGER NOT NULL,
    month_record INTEGER NOT NULL,
    year_record INTEGER NOT NULL,
    user_id INTEGER NOT NULL
);

CREATE TABLE focuses_month (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    focus VARCHAR NOT NULL,
    month_record INTEGER NOT NULL,
    year_record INTEGER NOT NULL,
    user_id INTEGER NOT NULL
);

CREATE TABLE tracker (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track VARCHAR NOT NULL,
    day_record INTEGER NOT NULL,
    month_record INTEGER NOT NULL,
    year_record INTEGER NOT NULL,
    user_id INTEGER NOT NULL
);

CREATE TABLE users(
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL
);