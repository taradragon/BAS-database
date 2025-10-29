-- SQL Schema for Company Database Dashboard
-- This schema defines all tables and relationships for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- User accounts table
CREATE TABLE user_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'CEO', '2ashbal', 'bar3me', 'kashaf', 'motakadam', 'morsha7in gawala', 'gawala'))
);

-- User department assignments (junction table)
CREATE TABLE user_departments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_accounts(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    UNIQUE(user_id, department_id)
);

-- Members table
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    first_name_ar VARCHAR(255) NOT NULL,
    second_name_ar VARCHAR(255) NOT NULL,
    third_name_ar VARCHAR(255) NOT NULL,
    fourth_name_ar VARCHAR(255) NOT NULL,
    full_name_en VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    national_id VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('Leader', 'Sub-Leader', 'Gawala', 'Rover', 'Member')),
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Pending', 'Inactive')) DEFAULT 'Active',
    join_date DATE NOT NULL
);

-- Meetings table
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);

-- Attendees table (junction table between members and meetings)
CREATE TABLE attendees (
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Excused', 'Absent')) DEFAULT 'Absent',
    PRIMARY KEY (member_id, meeting_id)
);

-- Transfer records table
CREATE TABLE transfer_records (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    from_department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    to_department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    transfer_date DATE NOT NULL,
    transferred_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending'
);

-- Transfer ladder table (defines allowed transfer paths)
CREATE TABLE transfer_ladder (
    source_dept_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    target_dept_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    PRIMARY KEY (source_dept_id, target_dept_id)
);

-- Insert default departments
INSERT INTO departments (name) VALUES 
('2ashbal'),
('bar3me'),
('kashaf'),
('motakadam'),
('morsha7in gawala'),
('gawala');

-- Insert default admin user
INSERT INTO user_accounts (name, password, role) VALUES 
('Admin', '1234', 'Admin');

-- Create indexes for better performance
CREATE INDEX idx_members_department_id ON members(department_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_attendees_meeting_id ON attendees(meeting_id);
CREATE INDEX idx_attendees_member_id ON attendees(member_id);
CREATE INDEX idx_transfer_records_member_id ON transfer_records(member_id);
CREATE INDEX idx_transfer_records_status ON transfer_records(status);