<?php
require_once '../db.php';
require_once '../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$required_fields = ['email', 'password'];
$errors = validateInput($input, $required_fields);

if (!empty($errors)) {
    sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
}

$email = sanitizeInput($input['email']);
$password = $input['password'];
$remember_me = isset($input['remember_me']) ? $input['remember_me'] : false;

try {
    // Find user by email
    $query = "SELECT id, name, email, password, role, phone, license_number FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        sendResponse(false, 'Invalid email or password', null, 401);
    }
    
    $user = $stmt->fetch();
    $hashed_password = hash('sha256', $password);
    
    if ($hashed_password !== $user['password']) {
        sendResponse(false, 'Invalid email or password', null, 401);
    }
    
    // Generate token
    $token = generateToken($user['id'], $user['email'], $user['role']);
    
    // Return user data (without password)
    $user_data = [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'phone' => $user['phone'],
        'license_number' => $user['license_number'],
        'token' => $token,
        'remember_me' => $remember_me
    ];
    
    sendResponse(true, 'Login successful', $user_data, 200);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>