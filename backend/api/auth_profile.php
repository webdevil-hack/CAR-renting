<?php
require_once '../db.php';
require_once '../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = getCurrentUser();
if (!$user) {
    sendResponse(false, 'Unauthorized', null, 401);
}

try {
    $query = "SELECT id, name, email, role, phone, license_number, created_at FROM users WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['user_id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        sendResponse(false, 'User not found', null, 404);
    }
    
    $user_data = $stmt->fetch();
    sendResponse(true, 'Profile retrieved successfully', $user_data, 200);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>