-- Create snapshots table for storing state history
CREATE TABLE IF NOT EXISTS snapshots (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description VARCHAR(255),
  data JSON NOT NULL,
  INDEX idx_created_at (created_at DESC)
);

-- Migration: Add snapshots table to existing database
-- Run this to add snapshot functionality
