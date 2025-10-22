<?php
require_once '../db.php';
require_once '../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = getCurrentUser();
if (!$user) {
    sendResponse(false, 'Unauthorized', null, 401);
}

$input = json_decode(file_get_contents('php://input'), true);

$required_fields = ['booking_id', 'amount', 'payment_method'];
$errors = validateInput($input, $required_fields);

if (!empty($errors)) {
    sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
}

$booking_id = intval($input['booking_id']);
$amount = floatval($input['amount']);
$payment_method = sanitizeInput($input['payment_method']);

try {
    // Verify booking belongs to user
    $booking_query = "SELECT * FROM bookings WHERE id = :booking_id AND user_id = :user_id";
    $booking_stmt = $db->prepare($booking_query);
    $booking_stmt->bindParam(':booking_id', $booking_id);
    $booking_stmt->bindParam(':user_id', $user['user_id']);
    $booking_stmt->execute();
    
    if ($booking_stmt->rowCount() === 0) {
        sendResponse(false, 'Booking not found', null, 404);
    }
    
    $booking = $booking_stmt->fetch();
    
    // Verify amount matches
    if (abs($booking['total_amount'] - $amount) > 0.01) {
        sendResponse(false, 'Amount mismatch', null, 400);
    }
    
    // Check if already paid
    $payment_check = "SELECT * FROM payments WHERE booking_id = :booking_id AND status = 'completed'";
    $payment_check_stmt = $db->prepare($payment_check);
    $payment_check_stmt->bindParam(':booking_id', $booking_id);
    $payment_check_stmt->execute();
    
    if ($payment_check_stmt->rowCount() > 0) {
        sendResponse(false, 'Booking already paid', null, 409);
    }
    
    // Simulate payment processing
    $transaction_id = 'TXN_' . uniqid() . '_' . time();
    $payment_status = 'completed'; // Simulate successful payment
    
    // Create payment record
    $payment_query = "INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status) 
                      VALUES (:booking_id, :amount, :payment_method, :transaction_id, :status)";
    
    $payment_stmt = $db->prepare($payment_query);
    $payment_stmt->bindParam(':booking_id', $booking_id);
    $payment_stmt->bindParam(':amount', $amount);
    $payment_stmt->bindParam(':payment_method', $payment_method);
    $payment_stmt->bindParam(':transaction_id', $transaction_id);
    $payment_stmt->bindParam(':status', $payment_status);
    
    if ($payment_stmt->execute()) {
        // Update booking status to confirmed
        $update_booking = "UPDATE bookings SET status = 'confirmed' WHERE id = :booking_id";
        $update_stmt = $db->prepare($update_booking);
        $update_stmt->bindParam(':booking_id', $booking_id);
        $update_stmt->execute();
        
        $response_data = [
            'transaction_id' => $transaction_id,
            'status' => $payment_status,
            'amount' => $amount,
            'booking_status' => 'confirmed'
        ];
        
        sendResponse(true, 'Payment processed successfully', $response_data, 200);
    } else {
        sendResponse(false, 'Payment processing failed', null, 500);
    }
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>