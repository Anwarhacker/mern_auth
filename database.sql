-- ============================================
-- AuthApp Database Schema
-- Run this file in MySQL Workbench or CLI:
--   mysql -u root -p < database.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS mern_auth_db;
USE mern_auth_db;

-- -------------------------
-- Users Table
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
  id                 INT          AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(100) NOT NULL,
  email              VARCHAR(150) UNIQUE NOT NULL,
  phone              VARCHAR(20)  DEFAULT NULL,
  password           VARCHAR(255) NOT NULL,
  reset_token        VARCHAR(255) DEFAULT NULL,
  reset_token_expiry BIGINT       DEFAULT NULL,
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -------------------------
-- Items Table
-- -------------------------
CREATE TABLE IF NOT EXISTS items (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT         DEFAULT NULL,
  status      ENUM('active', 'pending', 'completed') DEFAULT 'pending',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status  ON items(status);
