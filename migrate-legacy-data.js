// Migration script to convert legacy projects/tasks data to snapshot format
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function migrateLegacyData() {
  console.log('🔄 Migrating legacy data to snapshot system...\n');
  
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
    const [snapshotTables] = await connection.query("SHOW TABLES LIKE 'snapshots'");
    if (snapshotTables.length === 0) {
      console.error('❌ Snapshots table does not exist!');
      console.error('   Please run: npm run migrate:snapshots');
      process.exit(1);
    }
    
    // Check if any snapshots already exist
    const [existingSnapshots] = await connection.query('SELECT COUNT(*) as count FROM snapshots');
    if (existingSnapshots[0].count > 0) {
      console.log('⚠ Warning: Snapshots already exist in the database.');
      console.log(`   Found ${existingSnapshots[0].count} existing snapshot(s).`);
      
      // Ask if user wants to continue
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('   Continue and create migration snapshot anyway? (yes/no): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log('\n❌ Migration cancelled by user.');
        process.exit(0);
      }
      console.log();
    }
    
    // Check if legacy tables exist
    const [projectTables] = await connection.query("SHOW TABLES LIKE 'projects'");
    const [taskTables] = await connection.query("SHOW TABLES LIKE 'tasks'");
    
    if (projectTables.length === 0 || taskTables.length === 0) {
      console.log('⚠ Legacy tables (projects/tasks) do not exist.');
      console.log('   Nothing to migrate. Starting with empty state.\n');
      
      // Create empty initial snapshot
      const snapshotId = Date.now().toString();
      await connection.query(
        'INSERT INTO snapshots (id, description, data) VALUES (?, ?, ?)',
        [snapshotId, 'Initial empty state', JSON.stringify([])]
      );
      
      console.log('✓ Created empty initial snapshot');
      console.log('✅ Migration completed!\n');
      process.exit(0);
    }
    
    console.log('✓ Found legacy tables');
    
    // Fetch all projects
    console.log('📦 Reading projects...');
    const [projects] = await connection.query('SELECT * FROM projects ORDER BY created_at');
    console.log(`   Found ${projects.length} project(s)`);
    
    if (projects.length === 0) {
      console.log('\n⚠ No projects found. Creating empty snapshot.\n');
      const snapshotId = Date.now().toString();
      await connection.query(
        'INSERT INTO snapshots (id, description, data) VALUES (?, ?, ?)',
        [snapshotId, 'Migrated from legacy data (empty)', JSON.stringify([])]
      );
      console.log('✅ Migration completed!\n');
      process.exit(0);
    }
    
    // Fetch all tasks
    console.log('📝 Reading tasks...');
    const [tasks] = await connection.query('SELECT * FROM tasks ORDER BY created_at');
    console.log(`   Found ${tasks.length} task(s)`);
    
    // Build hierarchical structure
    console.log('🔨 Building hierarchical structure...');
    
    // Function to build task hierarchy
    function buildTaskHierarchy(tasks, parentId = null) {
      return tasks
        .filter(task => task.parent_id === parentId)
        .map(task => ({
          id: task.id,
          projectId: task.project_id,
          parentId: task.parent_id,
          title: task.title,
          description: task.description || '',
          status: task.status,
          sortOrder: task.sort_order || 0,
          subtasks: buildTaskHierarchy(tasks, task.id)
        }));
    }
    
    // Build complete data structure
    const snapshotData = projects.map(project => ({
      id: project.id,
      name: project.name,
      tasks: buildTaskHierarchy(tasks.filter(t => t.project_id === project.id), null)
    }));
    
    // Count total tasks including subtasks
    function countTasks(tasks) {
      return tasks.reduce((count, task) => {
        return count + 1 + countTasks(task.subtasks || []);
      }, 0);
    }
    
    const totalTasks = snapshotData.reduce((sum, project) => {
      return sum + countTasks(project.tasks);
    }, 0);
    
    console.log(`   Structured ${snapshotData.length} project(s) with ${totalTasks} task(s)\n`);
    
    // Display summary
    console.log('📊 Migration Summary:');
    snapshotData.forEach(project => {
      const taskCount = countTasks(project.tasks);
      console.log(`   - ${project.name}: ${taskCount} task(s)`);
    });
    console.log();
    
    // Create snapshot
    console.log('💾 Creating migration snapshot...');
    const snapshotId = Date.now().toString();
    const description = `Migrated from legacy data - ${snapshotData.length} project(s), ${totalTasks} task(s)`;
    
    await connection.query(
      'INSERT INTO snapshots (id, description, data) VALUES (?, ?, ?)',
      [snapshotId, description, JSON.stringify(snapshotData)]
    );
    
    console.log('✓ Snapshot created successfully');
    console.log(`   ID: ${snapshotId}`);
    console.log(`   Description: ${description}\n`);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Restart your server: npm run server:dev');
    console.log('   2. Refresh your frontend');
    console.log('   3. Your existing data is now available in the new system!');
    console.log('   4. (Optional) You can backup and drop the old tables if desired\n');
    console.log('⚠️  Note: The old projects/tasks tables are still in the database.');
    console.log('   They are no longer used, but kept for safety.');
    console.log('   You can delete them manually if you\'re confident everything works.\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    console.error('\nPlease check:');
    console.error('   - Database credentials in .env file');
    console.error('   - Database server is running');
    console.error('   - Snapshots table exists (run: npm run migrate:snapshots)');
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateLegacyData();
