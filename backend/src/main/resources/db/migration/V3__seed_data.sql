-- Roles are already inserted in V1, but ensuring they exist
INSERT INTO roles (name) SELECT 'ROLE_ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');
INSERT INTO roles (name) SELECT 'ROLE_COORDINATOR' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_COORDINATOR');
INSERT INTO roles (name) SELECT 'ROLE_STUDENT' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_STUDENT');

-- Insert Default Admin (Password is 'admin123' BCrypted)
INSERT INTO users (username, password, email, full_name, role_id)
VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnC', 'admin@ticclub.com', 'System Admin', 3)
ON CONFLICT (username) DO NOTHING;
