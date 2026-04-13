-- ============================================
-- Insert Demo Items for an Existing User
-- ============================================

-- Replace '1' with your actual user ID if different.
-- You can find your user ID by running: SELECT id, email FROM mern_auth_db.users;

USE mern_auth_db;

INSERT INTO items (user_id, title, description, status)
VALUES 
  (1, 'Welcome to your Dashboard! 👋', 'This is a sample item. You can edit, delete, or mark it as complete using the actions menu.', 'active'),
  (1, 'Explore features', 'Try testing out the live search, filtering by status, or adding a new item of your own.', 'pending'),
  (1, 'Account setup completed', 'You successfully registered and logged into the application.', 'completed');
