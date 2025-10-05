// Migration script to add snapshots table
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function applySnapshotMigration() {
  console.log('🔧 Applying snapshot system migration...\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'todolist'
  });

  try {
    console.log('✓ Connected to database');
    
    // Check if snapshots table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'snapshots'"
    );
    
    if (tables.length > 0) {
      console.log('⚠ Snapshots table already exists. Skipping creation.');
    } else {
      console.log('Creating snapshots table...');
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS snapshots (
          id VARCHAR(36) PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description VARCHAR(255),
          data JSON NOT NULL,
          INDEX idx_created_at (created_at DESC)
        )
      `);
      
      console.log('✓ Snapshots table created successfully');
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your server: npm run server:dev');
    console.log('   2. Refresh your frontend');
    console.log('   3. Start using the new snapshot-based save system!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nPlease check:');
    console.error('   - Database credentials in .env file');
    console.error('   - Database server is running');
    console.error('   - Database exists');
    process.exit(1);
  } finally {
    await connection.end();
  }
}

applySnapshotMigration();
