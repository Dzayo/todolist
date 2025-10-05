# Quick Start: Snapshot-Based Save System

## 🚀 Setup (One-Time)

### Step 1: Apply Database Migration

Run this command to add the snapshots table:

```bash
npm run migrate:snapshots
```

You should see:
```
✓ Connected to database
✓ Snapshots table created successfully
✅ Migration completed successfully!
```

### Step 2: Restart Server

```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend  
npm run dev
```

## 📖 How to Use

### Making Changes

Just work normally! Changes are kept in memory:
- ✏️ Add/edit/delete projects
- ✏️ Add/edit/delete tasks
- ✏️ Change task status
- ✏️ Add descriptions
- ✏️ Drag and drop tasks

You'll see **"Unsaved changes"** indicator appear in yellow.

### Saving Your Work

1. Click the **Save** button (green when you have changes)
2. Optionally add a description like:
   - "Sprint planning complete"
   - "End of day backup"
   - "Before major refactor"
3. Press Enter or click Save

Your current state is now saved with a timestamp!

### Viewing History

1. Click the **History** button (blue)
2. See all your saved snapshots
3. Each shows:
   - 📅 Date and time
   - 📝 Description (if you added one)
   - 👁️ View button
   - 🗑️ Delete button

### Viewing a Past Snapshot

1. In the History modal, click the 👁️ (eye) icon
2. See your projects/tasks exactly as they were
3. **Read-only** - you can't edit historical data
4. Click Close to return

### Discarding Unwanted Changes

If you made changes you don't want to keep:
1. **Don't click Save**
2. Refresh the page (F5)
3. The last saved snapshot loads
4. Your unwanted changes are gone!

## 💡 Tips

### Good Times to Save
- ✅ After completing a planning session
- ✅ End of work day
- ✅ Before making major changes
- ✅ After important milestones
- ✅ Before experimenting with reorganization

### Descriptions Help!
Add meaningful descriptions to find snapshots later:
- ❌ Bad: "save 1", "test", "asdf"
- ✅ Good: "Sprint 3 planning", "After client meeting", "Q1 goals set"

### Keep It Clean
Periodically delete old snapshots you don't need:
- In History modal, click 🗑️ on unwanted snapshots
- Keeps database lean and history manageable

## 🎯 Common Workflows

### Daily Work Session
```
1. Start working on tasks
2. Make progress throughout day
3. End of day: Save with "EOD [Date]"
4. Next day: Continue from saved state
```

### Planning Meeting
```
1. Open current state
2. Discuss and modify tasks in meeting
3. Save with "Sprint X Planning - [Date]"
4. Later: View history to see what was planned
```

### Experimentation
```
1. Save current state: "Before reorganization"
2. Try different task structure
3. Don't like it? Just refresh page
4. Like it? Save with "New organization"
```

## ⚙️ Technical Details

### What Gets Saved?
- All projects
- All tasks (including subtasks)
- Task titles, descriptions, and status
- Complete hierarchy

### What Doesn't Get Saved?
- UI state (which tasks are expanded)
- Which project is selected
- Modal states

### Data Format
Snapshots store complete state as JSON in database:
```json
{
  "id": "1696891234567",
  "description": "Sprint planning",
  "data": [
    {
      "id": "proj1",
      "name": "Project Name",
      "tasks": [ /* all tasks */ ]
    }
  ]
}
```

## 🔧 Troubleshooting

### "Failed to save snapshot"
- Check server is running
- Check database connection
- Look at server console for errors

### "Failed to load history"
- Ensure migration was run
- Check snapshots table exists
- Verify database permissions

### "Unsaved changes" won't go away
- Click Save to persist changes
- Or refresh page to discard

### Old projects/tasks API not working
- Old API endpoints still work but aren't used
- App now works entirely with snapshots
- You can delete old `projects` and `tasks` tables if desired

## 📞 Need Help?

Check these files for more info:
- `SNAPSHOT_SYSTEM.md` - Complete documentation
- Server logs in terminal
- Browser console (F12) for frontend errors
