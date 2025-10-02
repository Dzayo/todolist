-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create tasks table with hierarchical structure
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  parent_id VARCHAR(36) NULL,
  title VARCHAR(500) NOT NULL,
  status ENUM('Pending', 'Doing', 'Done') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_parent_id (parent_id)
);

-- Sample data (optional)
-- INSERT INTO projects (id, name) VALUES
-- ('sample-project-1', 'My First Project');
--
-- INSERT INTO tasks (id, project_id, parent_id, title, status) VALUES
-- ('task-1', 'sample-project-1', NULL, 'Sample Task', 'Pending'),
-- ('task-1-1', 'sample-project-1', 'task-1', 'Sample Subtask', 'Pending');
