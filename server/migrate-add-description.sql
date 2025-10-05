-- Migration: Add description and sort_order columns to tasks table
-- Run this if you have an existing database

ALTER TABLE tasks 
ADD COLUMN description TEXT AFTER title,
ADD COLUMN sort_order INT DEFAULT 0 AFTER status;
