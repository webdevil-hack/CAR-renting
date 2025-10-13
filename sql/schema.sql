-- Rentify Car Rental Platform Database Schema
-- Created for full-stack car rental application

CREATE DATABASE IF NOT EXISTS rentify;
USE rentify;

-- Users table for all user types (customers, owners, admin)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'owner', 'admin') DEFAULT 'customer',
    phone VARCHAR(20),
    license_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cars table for car listings
CREATE TABLE cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid') NOT NULL,
    transmission ENUM('manual', 'automatic') NOT NULL,
    seats INT NOT NULL,
    mileage VARCHAR(20),
    city VARCHAR(100) NOT NULL,
    description TEXT,
    images JSON,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_time TIME,
    return_time TIME,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Coupons table
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table (optional)
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    booking_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Wishlist table
CREATE TABLE wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, car_id)
);

-- Insert default admin user
INSERT INTO users (name, email, password, role, phone, license_number) VALUES
('Admin User', 'admin@rentify.com', SHA2('admin123', 256), 'admin', '1234567890', 'ADMIN001');

-- Insert sample car owner
INSERT INTO users (name, email, password, role, phone, license_number) VALUES
('John Doe', 'owner@rentify.com', SHA2('owner123', 256), 'owner', '9876543210', 'OWNER001');

-- Insert sample customer
INSERT INTO users (name, email, password, role, phone, license_number) VALUES
('Jane Smith', 'customer@rentify.com', SHA2('customer123', 256), 'customer', '5555555555', 'CUSTOMER001');

-- Insert sample cars
INSERT INTO cars (owner_id, title, brand, model, year, price_per_day, type, fuel_type, transmission, seats, mileage, city, description, images) VALUES
(2, 'Luxury BMW 3 Series', 'BMW', '3 Series', 2022, 150.00, 'Sedan', 'petrol', 'automatic', 5, '15000 km', 'New York', 'Premium luxury sedan with all modern features', '["car1.jpg", "car2.jpg", "car3.jpg"]'),
(2, 'Eco-Friendly Tesla Model 3', 'Tesla', 'Model 3', 2023, 200.00, 'Sedan', 'electric', 'automatic', 5, '5000 km', 'Los Angeles', 'Fully electric vehicle with autopilot features', '["tesla1.jpg", "tesla2.jpg", "tesla3.jpg"]'),
(2, 'Family Honda CR-V', 'Honda', 'CR-V', 2021, 120.00, 'SUV', 'petrol', 'automatic', 7, '25000 km', 'Chicago', 'Perfect for family trips with spacious interior', '["honda1.jpg", "honda2.jpg", "honda3.jpg"]');

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_amount, max_discount, expires_at) VALUES
('WELCOME20', 'percentage', 20.00, 100.00, 50.00, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('SAVE50', 'fixed', 50.00, 200.00, NULL, DATE_ADD(NOW(), INTERVAL 15 DAY)),
('FIRST10', 'percentage', 10.00, 50.00, 25.00, DATE_ADD(NOW(), INTERVAL 7 DAY));