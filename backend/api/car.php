<?php
require_once '../db.php';
require_once '../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

if (!isset($_GET['id']) || empty($_GET['id'])) {
    sendResponse(false, 'Car ID is required', null, 400);
}

$car_id = intval($_GET['id']);

try {
    $query = "SELECT c.*, u.name as owner_name, u.phone as owner_phone 
              FROM cars c 
              JOIN users u ON c.owner_id = u.id 
              WHERE c.id = :car_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':car_id', $car_id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        sendResponse(false, 'Car not found', null, 404);
    }
    
    $car = $stmt->fetch();
    
    // Parse images JSON
    $car['images'] = json_decode($car['images'], true) ?: [];
    
    // Get reviews for this car
    $reviews_query = "SELECT r.*, u.name as user_name 
                      FROM reviews r 
                      JOIN users u ON r.user_id = u.id 
                      WHERE r.car_id = :car_id 
                      ORDER BY r.created_at DESC";
    
    $reviews_stmt = $db->prepare($reviews_query);
    $reviews_stmt->bindParam(':car_id', $car_id);
    $reviews_stmt->execute();
    $reviews = $reviews_stmt->fetchAll();
    
    // Calculate average rating
    $avg_rating = 0;
    if (!empty($reviews)) {
        $total_rating = array_sum(array_column($reviews, 'rating'));
        $avg_rating = round($total_rating / count($reviews), 1);
    }
    
    $car['reviews'] = $reviews;
    $car['average_rating'] = $avg_rating;
    $car['total_reviews'] = count($reviews);
    
    sendResponse(true, 'Car details retrieved successfully', $car, 200);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>