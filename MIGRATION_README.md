# Migration Scripts Overview

This document explains all migration scripts available in the project.

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| **Column Migration** | `npm run migrate` | Adds `description` and `sort_order` columns to tasks table |
| **Snapshots Table** | `npm run migrate:snapshots` | Creates the `snapshots` table for the new save system |
| **Legacy Data** | `npm run migrate:legacy` | Migrates existing projects/tasks to first snapshot |

## Migration Paths

### Path 1: Fresh Installation (No Existing Data)

```bash
# Create snapshots table
npm run migrate:snapshots

# Start using the app
npm run server:dev
npm run dev
```

**Result:** Start with empty state, use snapshot-based saves from the beginning.

---

### Path 2: Upgrading from Old System (With Existing Data)

```bash
# Step 1: Add description/sort_order columns if needed
npm run migrate

# Step 2: Create snapshots table
npm run migrate:snapshots

# Step 3: Migrate your existing data
npm run migrate:legacy

# Step 4: Start server
npm run server:dev
npm run dev
```

**Result:** All existing data preserved in first snapshot, ready to use new system.

---

### Path 3: Already Using Old System, Want Both Systems

```bash
# Add new features to existing tables
npm run migrate

# Create snapshots table (but don't migrate yet)
npm run migrate:snapshots

# Continue using old auto-save OR
# Migrate later with: npm run migrate:legacy
```

**Result:** Both systems available, choose when to migrate.

## Script Details

### 1. Column Migration (`npm run migrate`)

**File:** `apply-migration.js`

**What it does:**
- Adds `description` TEXT column to tasks table
- Adds `sort_order` INT column to tasks table
- Safe to run multiple times (checks if columns exist)

**When to use:**
- Upgrading from version without these columns
- Before using task descriptions feature
- Before using drag & drop reordering

**Output:**
```
✓ Added "description" column
✓ Added "sort_order" column
✅ Migration completed successfully!
```

---

### 2. Snapshots Table (`npm run migrate:snapshots`)

**File:** `apply-snapshot-migration.js`

**What it does:**
- Creates `snapshots` table with:
  - `id` VARCHAR(36) - Unique identifier
  - `created_at` TIMESTAMP - When saved
  - `description` VARCHAR(255) - Optional label
  - `data` JSON - Complete state
  - Index on `created_at`

**When to use:**
- First time setting up snapshot system
- Required before using `npm run migrate:legacy`
- Required before using Save/History features

**Output:**
```
✓ Connected to database
✓ Snapshots table created successfully
✅ Migration completed successfully!
```

---

### 3. Legacy Data Migration (`npm run migrate:legacy`)

**File:** `migrate-legacy-data.js`

**What it does:**
1. Reads all projects from `projects` table
2. Reads all tasks from `tasks` table
3. Builds hierarchical structure (parent-child relationships)
4. Creates first snapshot with all data
5. Shows detailed summary

**When to use:**
- Transitioning from old auto-save system
- Want to preserve existing data
- Starting fresh with snapshots

**Requirements:**
- Snapshots table must exist (run `npm run migrate:snapshots` first)

**Safety Features:**
- Non-destructive (doesn't delete old tables)
- Warns if snapshots already exist
- Asks for confirmation before proceeding
- Handles empty data gracefully

**Output Example:**
```
🔄 Migrating legacy data to snapshot system...

✓ Connected to database
✓ Found legacy tables
📦 Reading projects...
   Found 3 project(s)
📝 Reading tasks...
   Found 15 task(s)
🔨 Building hierarchical structure...
   Structured 3 project(s) with 15 task(s)

📊 Migration Summary:
   - Work Project: 8 task(s)
   - Personal: 5 task(s)
   - Ideas: 2 task(s)

💾 Creating migration snapshot...
✓ Snapshot created successfully

✅ Migration completed successfully!
```

## Common Scenarios

### Scenario A: "I'm starting fresh"
```bash
npm run migrate:snapshots
npm run server:dev
```
Done! Use the app with snapshot system.

---

### Scenario B: "I have existing data and want to keep it"
```bash
npm run migrate              # If you don't have description/sort_order
npm run migrate:snapshots    # Create snapshots table
npm run migrate:legacy       # Move data to snapshots
npm run server:dev
```
Done! All data preserved in snapshot system.

---

### Scenario C: "I already migrated but want to run it again"
```bash
npm run migrate:legacy
# Answer "yes" when asked about existing snapshots
```
Creates another snapshot with current data.

---

### Scenario D: "Migration failed, what do I do?"

**Check:**
1. Database is running
2. Credentials in `.env` are correct
3. Database exists
4. You have proper permissions

**Try:**
```bash
# Test connection
mysql -u root -p todolist

# Verify tables
SHOW TABLES;

# Check snapshots table
DESCRIBE snapshots;

# Re-run migration
npm run migrate:legacy
```

## File Reference

| File | Type | Purpose |
|------|------|---------|
| `apply-migration.js` | Migration | Add columns to tasks table |
| `apply-snapshot-migration.js` | Migration | Create snapshots table |
| `migrate-legacy-data.js` | Migration | Convert old data to snapshots |
| `server/add-snapshots-table.sql` | SQL | Manual snapshots table creation |
| `server/migrate-add-description.sql` | SQL | Manual column addition |
| `LEGACY_MIGRATION_GUIDE.md` | Doc | Detailed migration guide |
| `SNAPSHOT_QUICK_START.md` | Doc | Quick start guide |
| `SNAPSHOT_SYSTEM.md` | Doc | Complete snapshot system docs |

## Verification Steps

After running migrations, verify:

### Check Database
```sql
-- Verify snapshots table exists
SHOW TABLES LIKE 'snapshots';

-- Check snapshots table structure
DESCRIBE snapshots;

-- See if data was migrated
SELECT id, created_at, description FROM snapshots;
```

### Check Application
1. Start server: `npm run server:dev`
2. Open browser: `http://localhost:5173`
3. See if projects/tasks appear
4. Click History → verify snapshot exists
5. Make changes → see "Unsaved changes"
6. Click Save → test saving works

## Rollback

If you need to rollback:

### To Remove Snapshots Table
```sql
DROP TABLE IF EXISTS snapshots;
```

### To Remove Added Columns
```sql
ALTER TABLE tasks 
DROP COLUMN description,
DROP COLUMN sort_order;
```

### To Start Over Completely
```bash
# Backup first!
mysqldump -u root -p todolist > backup.sql

# Then drop all tables
mysql -u root -p todolist
DROP TABLE IF EXISTS snapshots;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;

# Restore from backup
mysql -u root -p todolist < backup.sql
```

## Best Practices

1. **Always backup before migrating**
   ```bash
   mysqldump -u root -p todolist > backup_before_migration.sql
   ```

2. **Run migrations in order**
   - Columns first (if needed)
   - Snapshots table second
   - Legacy data last

3. **Test in development first**
   - Use a separate test database
   - Verify everything works
   - Then migrate production

4. **Keep old tables temporarily**
   - Don't delete projects/tasks tables immediately
   - Wait a few days/weeks
   - Verify everything works perfectly
   - Then optionally delete

5. **Document your migration**
   - Note which scripts you ran
   - Save the output
   - Record any issues encountered

## Troubleshooting

### "Table already exists"
- Safe to ignore if it's the right table
- Check with: `DESCRIBE table_name`

### "Column already exists"
- Safe to ignore
- Script checks before adding

### "Cannot connect to database"
- Check MySQL is running
- Verify `.env` credentials
- Test with: `mysql -u root -p`

### "No data migrated"
- Check if old tables have data
- Verify table names are correct
- Look for errors in script output

### "Snapshot data looks wrong"
- Check parent_id relationships in tasks
- Verify project_id foreign keys
- Run migration again if needed

## Support

For more help:
- Read `LEGACY_MIGRATION_GUIDE.md` for detailed instructions
- Check server logs for error details
- Verify database schema with `DESCRIBE` commands
- Test queries manually in MySQL console

## Summary

```bash
# Complete migration for existing users:
npm run migrate              # (Optional) Add columns
npm run migrate:snapshots    # Create snapshots table
npm run migrate:legacy       # Migrate existing data
npm run server:dev          # Start and test

# For new users:
npm run migrate:snapshots    # Create snapshots table
npm run server:dev          # Start fresh
```

Your data is safe and the snapshot system is ready! 🎉
