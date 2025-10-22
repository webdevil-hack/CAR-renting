<?php
require_once '../db.php';
require_once '../helpers.php';

$user = getCurrentUser();
if (!$user) {
    sendResponse(false, 'Unauthorized', null, 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get bookings for current user
    $query = "SELECT b.*, c.title as car_title, c.brand, c.model, c.images, u.name as owner_name 
              FROM bookings b 
              JOIN cars c ON b.car_id = c.id 
              JOIN users u ON c.owner_id = u.id 
              WHERE b.user_id = :user_id 
              ORDER BY b.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['user_id']);
    $stmt->execute();
    
    $bookings = $stmt->fetchAll();
    
    // Parse images JSON
    foreach ($bookings as &$booking) {
        $booking['images'] = json_decode($booking['images'], true) ?: [];
    }
    
    sendResponse(true, 'Bookings retrieved successfully', $bookings, 200);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new booking
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required_fields = ['car_id', 'start_date', 'end_date'];
    $errors = validateInput($input, $required_fields);
    
    if (!empty($errors)) {
        sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
    }
    
    $car_id = intval($input['car_id']);
    $start_date = sanitizeInput($input['start_date']);
    $end_date = sanitizeInput($input['end_date']);
    $pickup_time = sanitizeInput($input['pickup_time'] ?? '10:00');
    $return_time = sanitizeInput($input['return_time'] ?? '18:00');
    $coupon_code = sanitizeInput($input['coupon_code'] ?? '');
    
    // Validate dates
    $start = new DateTime($start_date);
    $end = new DateTime($end_date);
    $today = new DateTime();
    
    if ($start < $today) {
        sendResponse(false, 'Start date cannot be in the past', null, 400);
    }
    
    if ($end <= $start) {
        sendResponse(false, 'End date must be after start date', null, 400);
    }
    
    try {
        // Get car details
        $car_query = "SELECT * FROM cars WHERE id = :car_id AND is_available = 1";
        $car_stmt = $db->prepare($car_query);
        $car_stmt->bindParam(':car_id', $car_id);
        $car_stmt->execute();
        
        if ($car_stmt->rowCount() === 0) {
            sendResponse(false, 'Car not available', null, 404);
        }
        
        $car = $car_stmt->fetch();
        
        // Check availability
        if (!checkCarAvailability($car_id, $start_date, $end_date)) {
            sendResponse(false, 'Car is not available for the selected dates', null, 409);
        }
        
        // Calculate total amount
        $total_amount = calculateTotalAmount($car['price_per_day'], $start_date, $end_date);
        
        // Apply coupon discount if provided
        $discount_amount = 0;
        if (!empty($coupon_code)) {
            $coupon_query = "SELECT * FROM coupons WHERE code = :code AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())";
            $coupon_stmt = $db->prepare($coupon_query);
            $coupon_stmt->bindParam(':code', $coupon_code);
            $coupon_stmt->execute();
            
            if ($coupon_stmt->rowCount() > 0) {
                $coupon = $coupon_stmt->fetch();
                
                if ($total_amount >= $coupon['min_amount']) {
                    if ($coupon['discount_type'] === 'percentage') {
                        $discount_amount = ($total_amount * $coupon['discount_value']) / 100;
                        if ($coupon['max_discount']) {
                            $discount_amount = min($discount_amount, $coupon['max_discount']);
                        }
                    } else {
                        $discount_amount = $coupon['discount_value'];
                    }
                }
            }
        }
        
        $final_amount = $total_amount - $discount_amount;
        
        // Create booking
        $booking_query = "INSERT INTO bookings (user_id, car_id, start_date, end_date, pickup_time, return_time, total_amount, status) 
                          VALUES (:user_id, :car_id, :start_date, :end_date, :pickup_time, :return_time, :total_amount, 'pending')";
        
        $booking_stmt = $db->prepare($booking_query);
        $booking_stmt->bindParam(':user_id', $user['user_id']);
        $booking_stmt->bindParam(':car_id', $car_id);
        $booking_stmt->bindParam(':start_date', $start_date);
        $booking_stmt->bindParam(':end_date', $end_date);
        $booking_stmt->bindParam(':pickup_time', $pickup_time);
        $booking_stmt->bindParam(':return_time', $return_time);
        $booking_stmt->bindParam(':total_amount', $final_amount);
        
        if ($booking_stmt->execute()) {
            $booking_id = $db->lastInsertId();
            
            $response_data = [
                'booking_id' => $booking_id,
                'total_amount' => $final_amount,
                'discount_amount' => $discount_amount,
                'status' => 'pending'
            ];
            
            sendResponse(true, 'Booking created successfully', $response_data, 201);
        } else {
            sendResponse(false, 'Failed to create booking', null, 500);
        }
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update booking status (for owners and admin)
    if (!in_array($user['role'], ['owner', 'admin'])) {
        sendResponse(false, 'Unauthorized', null, 403);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['booking_id']) || !isset($input['status'])) {
        sendResponse(false, 'Booking ID and status are required', null, 400);
    }
    
    $booking_id = intval($input['booking_id']);
    $status = sanitizeInput($input['status']);
    
    if (!in_array($status, ['confirmed', 'cancelled', 'completed'])) {
        sendResponse(false, 'Invalid status', null, 400);
    }
    
    try {
        // Check if booking exists and user has permission
        $check_query = "SELECT b.*, c.owner_id FROM bookings b JOIN cars c ON b.car_id = c.id WHERE b.id = :booking_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':booking_id', $booking_id);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() === 0) {
            sendResponse(false, 'Booking not found', null, 404);
        }
        
        $booking = $check_stmt->fetch();
        
        // Check permission (owner can only manage their own cars, admin can manage all)
        if ($user['role'] === 'owner' && $booking['owner_id'] != $user['user_id']) {
            sendResponse(false, 'Unauthorized to manage this booking', null, 403);
        }
        
        // Update booking status
        $update_query = "UPDATE bookings SET status = :status WHERE id = :booking_id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':status', $status);
        $update_stmt->bindParam(':booking_id', $booking_id);
        
        if ($update_stmt->execute()) {
            sendResponse(true, 'Booking status updated successfully', null, 200);
        } else {
            sendResponse(false, 'Failed to update booking status', null, 500);
        }
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
    }
    
} else {
    sendResponse(false, 'Method not allowed', null, 405);
}
?>