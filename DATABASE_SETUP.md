# Database Setup Guide

## Prerequisites
- MySQL Server installed and running
- Node.js and npm/pnpm installed

## Step 1: Configure Environment Variables

1. Copy the environment example file:
   ```bash
   Copy-Item .env.example .env
   ```

2. Verify the `.env` file contains:
   ```
   PORT=3001
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=todolist
   ```

## Step 2: Create the Database

1. Connect to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS todolist;
   USE todolist;
   ```

3. Run the initialization script:
   ```bash
   mysql -u root -p todolist < server/init-db.sql
   ```

   Or manually execute the SQL from `server/init-db.sql` in your MySQL client.

## Step 3: Install Dependencies

```bash
npm install
# or
pnpm install
```

## Step 4: Run the Application

### Option 1: Run Backend and Frontend Separately

Terminal 1 - Start the backend server:
```bash
npm run server:dev
# or for production
npm run server
```

Terminal 2 - Start the frontend:
```bash
npm run dev
```

### Option 2: Install concurrently for simultaneous run

```bash
npm install --save-dev concurrently
```

Then add to `package.json` scripts:
```json
"dev:all": "concurrently \"npm run server:dev\" \"npm run dev\""
```

Run both:
```bash
npm run dev:all
```

## Verify Setup

1. **Backend Health Check**: http://localhost:3001/api/health
2. **Frontend**: http://localhost:5173
3. **Check database connection** - The server console should show "✅ Database connected successfully"

## Troubleshooting

### Database Connection Failed
- Verify MySQL is running
- Check credentials in `.env` file
- Ensure database `todolist` exists

### Port Already in Use
- Change `PORT` in `.env` to another port (e.g., 3002)
- Update `API_BASE_URL` in `src/api.js` accordingly

### CORS Errors
- Ensure backend server is running
- Check that CORS is enabled in `server/index.js`
