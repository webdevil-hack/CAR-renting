<?php
require_once '../db.php';
require_once '../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$required_fields = ['name', 'email', 'password', 'phone', 'license_number', 'role'];
$errors = validateInput($input, $required_fields);

if (!empty($errors)) {
    sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
}

$name = sanitizeInput($input['name']);
$email = sanitizeInput($input['email']);
$password = $input['password'];
$phone = sanitizeInput($input['phone']);
$license_number = sanitizeInput($input['license_number']);
$role = sanitizeInput($input['role']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format', null, 400);
}

// Validate role
if (!in_array($role, ['customer', 'owner'])) {
    sendResponse(false, 'Invalid role. Must be customer or owner', null, 400);
}

// Validate password strength
if (strlen($password) < 6) {
    sendResponse(false, 'Password must be at least 6 characters long', null, 400);
}

try {
    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        sendResponse(false, 'Email already registered', null, 409);
    }
    
    // Hash password
    $hashed_password = hash('sha256', $password);
    
    // Insert new user
    $insert_query = "INSERT INTO users (name, email, password, role, phone, license_number) 
                     VALUES (:name, :email, :password, :role, :phone, :license_number)";
    $insert_stmt = $db->prepare($insert_query);
    $insert_stmt->bindParam(':name', $name);
    $insert_stmt->bindParam(':email', $email);
    $insert_stmt->bindParam(':password', $hashed_password);
    $insert_stmt->bindParam(':role', $role);
    $insert_stmt->bindParam(':phone', $phone);
    $insert_stmt->bindParam(':license_number', $license_number);
    
    if ($insert_stmt->execute()) {
        $user_id = $db->lastInsertId();
        
        // Generate token
        $token = generateToken($user_id, $email, $role);
        
        // Return user data (without password)
        $user_data = [
            'id' => $user_id,
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'phone' => $phone,
            'license_number' => $license_number,
            'token' => $token
        ];
        
        sendResponse(true, 'Registration successful', $user_data, 201);
    } else {
        sendResponse(false, 'Registration failed', null, 500);
    }
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>