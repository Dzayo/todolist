# Snapshot-Based Save System

## Overview

The application now uses a **snapshot-based save system** where changes are kept in memory and only saved to the database when you explicitly click the Save button. This creates a history of states that you can view later.

## Key Changes

### 🔄 No Auto-Save
- **Before**: Every change was immediately saved to the database
- **Now**: All changes are kept in memory until you manually save
- Yellow "Unsaved changes" indicator appears when you have uncommitted changes

### 💾 Manual Save
- Click the **Save** button in the header to save current state
- Add an optional description to identify the save point
- Each save creates a timestamped snapshot in the database

### 📜 Snapshot History
- Click the **History** button to view all saved snapshots
- Each snapshot shows:
  - Date and time it was saved
  - Optional description
  - View and Delete actions

### 👁️ Read-Only Snapshot Viewer
- Click the eye icon on any snapshot to view it
- See projects and tasks exactly as they were at that moment
- Cannot edit historical snapshots (read-only)
- Yellow banner indicates you're viewing a past state

## How It Works

### Data Flow

```
User makes changes → In-memory state updated → "Unsaved changes" indicator appears
                                                         ↓
                                            User clicks Save button
                                                         ↓
                                        Save dialog appears for description
                                                         ↓
                                    Snapshot created with timestamp + data
                                                         ↓
                                        Stored in database as JSON
```

### Database Structure

**New Table: `snapshots`**
```sql
- id (VARCHAR): Unique identifier
- created_at (TIMESTAMP): When snapshot was created
- description (VARCHAR): Optional user description
- data (JSON): Complete state of all projects and tasks
```

## Features

### 1. Save Dialog
- Optional description field
- Press Enter to save quickly
- Descriptions help identify important milestones

### 2. History Modal
- Shows all snapshots chronologically (newest first)
- Each entry displays:
  - 🕐 Timestamp
  - 📝 Description (if provided)
  - 👁️ View button
  - 🗑️ Delete button

### 3. Snapshot Viewer
- Full read-only view of past state
- Shows all projects and their tasks
- Task status indicators (Pending, Doing, Done)
- Task descriptions visible
- Cannot modify historical data

## Benefits

1. **Version Control**: Track how your tasks evolved over time
2. **Experimentation**: Make changes freely without fear of losing data
3. **Milestones**: Save important states (e.g., "Sprint 1 Complete")
4. **Comparison**: View how tasks changed between snapshots
5. **Recovery**: If you make mistakes, just don't save and reload

## Usage Examples

### Example 1: Planning Session
1. Make changes to your tasks
2. Click Save
3. Description: "Initial sprint planning"
4. Continue working...
5. Click Save again
6. Description: "After refinement meeting"

### Example 2: Viewing History
1. Click History button
2. See all your saves
3. Click eye icon on "Initial sprint planning"
4. View tasks as they were at that time
5. Close and return to current state

### Example 3: Discarding Changes
1. Make some changes
2. Realize you don't like them
3. Simply refresh the page
4. Last saved snapshot is loaded
5. Changes are gone

## Migration Required

### For Existing Databases

Run this command to add the snapshots table:

```bash
# Using the migration script
npm run migrate

# Or manually in MySQL
mysql -u root -p todolist < server/add-snapshots-table.sql
```

### For New Installations

The `init-db.sql` script needs to be updated to include the snapshots table.

## API Endpoints

### GET `/api/snapshots`
Get all snapshots (metadata only, no full data)

### GET `/api/snapshots/:id`
Get specific snapshot with complete data

### GET `/api/snapshots/latest/data`
Get the most recent snapshot

### POST `/api/snapshots`
Create new snapshot
```json
{
  "id": "timestamp",
  "description": "Optional description",
  "data": [ /* complete projects array */ ]
}
```

### DELETE `/api/snapshots/:id`
Delete a snapshot

## UI Components

### Header Controls
- **Unsaved Changes Indicator**: Yellow dot + text when changes exist
- **Save Button**: Green when changes exist, gray when saved
- **History Button**: Blue, always accessible

### Modals
1. **Save Dialog**: Simple input for description
2. **History List**: Scrollable list of snapshots
3. **Snapshot Viewer**: Full-screen read-only view

## Performance Notes

- Snapshots store complete state as JSON
- History list loads metadata only (fast)
- Full snapshot data loaded only when viewing
- Consider cleaning old snapshots periodically

## Future Enhancements

Possible additions:
- Restore snapshot (make it current state)
- Compare two snapshots
- Export snapshot as JSON file
- Import snapshot from file
- Auto-save drafts (with distinction from manual saves)
- Snapshot tagging/categorization
