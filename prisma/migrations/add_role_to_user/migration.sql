-- Add role column to User table with default value (MySQL enum type)
ALTER TABLE `User` ADD COLUMN `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER';
