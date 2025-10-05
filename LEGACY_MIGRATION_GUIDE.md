# Legacy Data Migration Guide

## Overview

This guide helps you migrate existing data from the old database structure (`projects` and `tasks` tables) to the new snapshot-based system.

## When Do You Need This?

**You need this migration if:**
- ✅ You were using the old version of the app
- ✅ You have existing projects and tasks in the database
- ✅ You want to preserve your data when switching to snapshots

**You DON'T need this if:**
- ❌ You're starting fresh with the snapshot system
- ❌ You don't have any existing data
- ❌ You've already run this migration

## Quick Start

### One-Command Migration

```bash
npm run migrate:legacy
```

This will:
1. Read all data from `projects` and `tasks` tables
2. Build the hierarchical structure
3. Create your first snapshot with all existing data
4. Show a summary of what was migrated

## Step-by-Step Guide

### Step 1: Ensure Snapshots Table Exists

First, make sure the snapshots table is set up:

```bash
npm run migrate:snapshots
```

### Step 2: Run Legacy Data Migration

```bash
npm run migrate:legacy
```

### Step 3: Review the Output

You'll see something like:

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
   ID: 1696891234567
   Description: Migrated from legacy data - 3 project(s), 15 task(s)

✅ Migration completed successfully!
```

### Step 4: Verify in the App

1. Restart your server: `npm run server:dev`
2. Open the app in browser
3. Your projects and tasks should be visible
4. Click **History** → You'll see the migration snapshot

## What Gets Migrated?

### Projects
- ✅ Project ID
- ✅ Project name
- ✅ All associated tasks

### Tasks
- ✅ Task ID
- ✅ Task title
- ✅ Task description
- ✅ Task status (Pending/Doing/Done)
- ✅ Complete parent-child hierarchy (subtasks)
- ✅ Sort order

### NOT Migrated
- ❌ Created/updated timestamps (replaced by snapshot timestamp)
- ❌ Any custom fields not in the schema

## Safety Features

### 1. Non-Destructive
The script **DOES NOT delete** the old tables. Your original data remains safe.

### 2. Duplicate Check
If snapshots already exist, the script asks for confirmation:

```
⚠ Warning: Snapshots already exist in the database.
   Found 2 existing snapshot(s).
   Continue and create migration snapshot anyway? (yes/no):
```

Type `yes` to continue or `no` to cancel.

### 3. Empty State Handling
If you have no existing data, it creates an empty initial snapshot:

```
⚠ No projects found. Creating empty snapshot.
✅ Migration completed!
```

## Troubleshooting

### "Snapshots table does not exist"

**Error:**
```
❌ Snapshots table does not exist!
   Please run: npm run migrate:snapshots
```

**Solution:**
```bash
npm run migrate:snapshots
npm run migrate:legacy
```

### "Legacy tables do not exist"

**Message:**
```
⚠ Legacy tables (projects/tasks) do not exist.
   Nothing to migrate. Starting with empty state.
```

**Meaning:** You're starting fresh. This is normal if you haven't used the old version.

### "Failed to connect to database"

**Check:**
- Database server is running
- `.env` file has correct credentials
- Database name is correct

### Data Looks Wrong

**If tasks are missing or hierarchy is broken:**

1. Check the original tables still exist:
   ```sql
   SELECT * FROM projects;
   SELECT * FROM tasks;
   ```

2. Verify `parent_id` relationships in tasks table

3. Re-run migration after fixing data

## After Migration

### Verify Everything Works

1. ✅ All projects appear
2. ✅ All tasks are present
3. ✅ Subtask hierarchy is correct
4. ✅ Task statuses are preserved
5. ✅ Descriptions are intact

### Optional: Clean Up Old Tables

Once you're confident everything works, you can remove the old tables:

```sql
-- BACKUP FIRST!
-- Then:
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
```

⚠️ **Warning:** Only do this after thoroughly testing the new system!

### Recommended: Backup First

Before dropping tables, export them:

```bash
mysqldump -u root -p todolist projects tasks > backup_legacy_tables.sql
```

## Migration Scenarios

### Scenario 1: First Time Setup
```bash
# Start fresh with snapshot system
npm run migrate:snapshots
npm run migrate:legacy  # Creates empty snapshot
npm run server:dev
```

### Scenario 2: Existing User Upgrading
```bash
# Preserve existing data
npm run migrate:snapshots
npm run migrate:legacy  # Migrates all data
npm run server:dev
# Test thoroughly
# Optionally backup and drop old tables
```

### Scenario 3: Already Has Snapshots
```bash
npm run migrate:legacy
# Asks: "Continue and create migration snapshot anyway?"
# Type 'yes' to add another snapshot with legacy data
# Type 'no' to cancel
```

## Technical Details

### Data Structure

**Old Structure:**
```
projects table:
  - id
  - name
  - created_at

tasks table:
  - id
  - project_id (FK)
  - parent_id (FK, nullable)
  - title
  - description
  - status
  - sort_order
```

**New Structure (Snapshot):**
```json
{
  "id": "timestamp",
  "description": "Migrated from legacy data...",
  "data": [
    {
      "id": "proj1",
      "name": "Project Name",
      "tasks": [
        {
          "id": "task1",
          "title": "Task Title",
          "description": "...",
          "status": "Pending",
          "subtasks": [
            // Nested subtasks...
          ]
        }
      ]
    }
  ]
}
```

### Hierarchy Building

The script recursively builds the task hierarchy:

1. Find all root-level tasks (`parent_id = null`)
2. For each task, find its children
3. Recursively process subtasks
4. Maintain proper nesting depth

### Performance

- Handles thousands of tasks efficiently
- Single database transaction
- Memory-efficient recursive processing

## Support

If you encounter issues:

1. Check server logs for detailed errors
2. Verify database schema matches expected structure
3. Ensure all foreign key relationships are valid
4. Try running each migration step separately

## Summary

```bash
# Complete migration process
npm run migrate:snapshots    # Step 1: Create snapshots table
npm run migrate:legacy        # Step 2: Migrate old data
npm run server:dev           # Step 3: Start server
# Step 4: Test in browser
# Step 5: (Optional) Backup and drop old tables
```

Your data is now safely migrated to the snapshot system! 🎉
