<?php
// Helper functions for Rentify backend

function generateToken($user_id, $email, $role) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user_id,
        'email' => $email,
        'role' => $role,
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function validateToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[2]));
    
    $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return false;
    }
    
    $payloadData = json_decode($payload, true);
    
    if ($payloadData['exp'] < time()) {
        return false;
    }
    
    return $payloadData;
}

function getCurrentUser() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    if (!$token) {
        return null;
    }
    
    return validateToken($token);
}

function sendResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

function validateInput($data, $required_fields) {
    $errors = [];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = ucfirst($field) . ' is required';
        }
    }
    
    return $errors;
}

function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function calculateTotalAmount($price_per_day, $start_date, $end_date) {
    $start = new DateTime($start_date);
    $end = new DateTime($end_date);
    $days = $start->diff($end)->days + 1;
    return $price_per_day * $days;
}

function checkCarAvailability($car_id, $start_date, $end_date, $exclude_booking_id = null) {
    global $db;
    
    $query = "SELECT COUNT(*) as count FROM bookings 
              WHERE car_id = :car_id 
              AND status IN ('confirmed', 'pending')
              AND ((start_date <= :end_date AND end_date >= :start_date))";
    
    if ($exclude_booking_id) {
        $query .= " AND id != :exclude_booking_id";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':car_id', $car_id);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    
    if ($exclude_booking_id) {
        $stmt->bindParam(':exclude_booking_id', $exclude_booking_id);
    }
    
    $stmt->execute();
    $result = $stmt->fetch();
    
    return $result['count'] == 0;
}

function uploadImage($file, $upload_dir = '../frontend/images/') {
    if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowed_types)) {
        return false;
    }
    
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = uniqid() . '.' . $file_extension;
    $upload_path = $upload_dir . $new_filename;
    
    if (move_uploaded_file($file['tmp_name'], $upload_path)) {
        return $new_filename;
    }
    
    return false;
}
?>