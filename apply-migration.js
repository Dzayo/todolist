// Simple script to apply database migration
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigration() {
  console.log('Connecting to database...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'todolist'
  });

  try {
    console.log('Connected successfully!');
    
    // Check if columns already exist
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM tasks WHERE Field IN ('description', 'sort_order')"
    );
    
    if (columns.length === 2) {
      console.log('✓ Migration already applied! Columns "description" and "sort_order" already exist.');
      return;
    }
    
    if (columns.length > 0) {
      console.log('⚠ Partial migration detected. Some columns exist but not all.');
    }
    
    console.log('Applying migration...');
    
    // Add description column if it doesn't exist
    if (!columns.find(col => col.Field === 'description')) {
      await connection.query(
        'ALTER TABLE tasks ADD COLUMN description TEXT AFTER title'
      );
      console.log('✓ Added "description" column');
    }
    
    // Add sort_order column if it doesn't exist
    if (!columns.find(col => col.Field === 'sort_order')) {
      await connection.query(
        'ALTER TABLE tasks ADD COLUMN sort_order INT DEFAULT 0 AFTER status'
      );
      console.log('✓ Added "sort_order" column');
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('You can now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

applyMigration();
