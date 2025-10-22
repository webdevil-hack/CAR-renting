<?php
require_once '../db.php';
require_once '../helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Validate coupon code
    if (!isset($_GET['code']) || empty($_GET['code'])) {
        sendResponse(false, 'Coupon code is required', null, 400);
    }
    
    $coupon_code = sanitizeInput($_GET['code']);
    
    try {
        $query = "SELECT * FROM coupons 
                  WHERE code = :code 
                  AND is_active = 1 
                  AND (expires_at IS NULL OR expires_at > NOW())";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':code', $coupon_code);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            sendResponse(false, 'Invalid or expired coupon code', null, 404);
        }
        
        $coupon = $stmt->fetch();
        
        // Remove sensitive fields
        unset($coupon['id']);
        unset($coupon['created_at']);
        
        sendResponse(true, 'Coupon validated successfully', $coupon, 200);
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new coupon (admin only)
    $user = getCurrentUser();
    if (!$user || $user['role'] !== 'admin') {
        sendResponse(false, 'Unauthorized. Only admin can create coupons.', null, 403);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required_fields = ['code', 'discount_type', 'discount_value'];
    $errors = validateInput($input, $required_fields);
    
    if (!empty($errors)) {
        sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
    }
    
    try {
        $query = "INSERT INTO coupons (code, discount_type, discount_value, min_amount, max_discount, expires_at, is_active) 
                  VALUES (:code, :discount_type, :discount_value, :min_amount, :max_discount, :expires_at, :is_active)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':code', sanitizeInput($input['code']));
        $stmt->bindParam(':discount_type', sanitizeInput($input['discount_type']));
        $stmt->bindParam(':discount_value', floatval($input['discount_value']));
        $stmt->bindParam(':min_amount', floatval($input['min_amount'] ?? 0));
        $stmt->bindParam(':max_discount', $input['max_discount'] ? floatval($input['max_discount']) : null);
        $stmt->bindParam(':expires_at', $input['expires_at'] ? sanitizeInput($input['expires_at']) : null);
        $stmt->bindParam(':is_active', $input['is_active'] ?? true);
        
        if ($stmt->execute()) {
            $coupon_id = $db->lastInsertId();
            sendResponse(true, 'Coupon created successfully', ['coupon_id' => $coupon_id], 201);
        } else {
            sendResponse(false, 'Failed to create coupon', null, 500);
        }
        
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            sendResponse(false, 'Coupon code already exists', null, 409);
        }
        sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
    }
    
} else {
    sendResponse(false, 'Method not allowed', null, 405);
}
?>