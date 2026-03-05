-- Create Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Insert Default Roles
INSERT INTO roles (name) VALUES ('ROLE_STUDENT'), ('ROLE_COORDINATOR'), ('ROLE_ADMIN');

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Student Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50),
    registration_year INTEGER,
    phone_number VARCHAR(15)
);

-- Create Team Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Team Members Mapping
CREATE TABLE team_members (
    team_id INTEGER REFERENCES teams(id),
    student_id INTEGER REFERENCES students(id),
    PRIMARY KEY (team_id, student_id)
);
