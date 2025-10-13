<?php
require_once '../db.php';
require_once '../helpers.php';

$user = getCurrentUser();
if (!$user || $user['role'] !== 'admin') {
    sendResponse(false, 'Unauthorized. Admin access required.', null, 403);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get dashboard statistics
        $stats = [];
        
        // Total users
        $users_query = "SELECT COUNT(*) as total FROM users WHERE role = 'customer'";
        $users_stmt = $db->prepare($users_query);
        $users_stmt->execute();
        $stats['total_customers'] = $users_stmt->fetch()['total'];
        
        // Total owners
        $owners_query = "SELECT COUNT(*) as total FROM users WHERE role = 'owner'";
        $owners_stmt = $db->prepare($owners_query);
        $owners_stmt->execute();
        $stats['total_owners'] = $owners_stmt->fetch()['total'];
        
        // Total cars
        $cars_query = "SELECT COUNT(*) as total FROM cars";
        $cars_stmt = $db->prepare($cars_query);
        $cars_stmt->execute();
        $stats['total_cars'] = $cars_stmt->fetch()['total'];
        
        // Available cars
        $available_cars_query = "SELECT COUNT(*) as total FROM cars WHERE is_available = 1";
        $available_cars_stmt = $db->prepare($available_cars_query);
        $available_cars_stmt->execute();
        $stats['available_cars'] = $available_cars_stmt->fetch()['total'];
        
        // Total bookings
        $bookings_query = "SELECT COUNT(*) as total FROM bookings";
        $bookings_stmt = $db->prepare($bookings_query);
        $bookings_stmt->execute();
        $stats['total_bookings'] = $bookings_stmt->fetch()['total'];
        
        // Confirmed bookings
        $confirmed_bookings_query = "SELECT COUNT(*) as total FROM bookings WHERE status = 'confirmed'";
        $confirmed_bookings_stmt = $db->prepare($confirmed_bookings_query);
        $confirmed_bookings_stmt->execute();
        $stats['confirmed_bookings'] = $confirmed_bookings_stmt->fetch()['total'];
        
        // Total revenue
        $revenue_query = "SELECT SUM(amount) as total FROM payments WHERE status = 'completed'";
        $revenue_stmt = $db->prepare($revenue_query);
        $revenue_stmt->execute();
        $stats['total_revenue'] = $revenue_stmt->fetch()['total'] ?? 0;
        
        // Recent bookings
        $recent_bookings_query = "SELECT b.*, c.title as car_title, c.brand, c.model, u.name as customer_name 
                                 FROM bookings b 
                                 JOIN cars c ON b.car_id = c.id 
                                 JOIN users u ON b.user_id = u.id 
                                 ORDER BY b.created_at DESC 
                                 LIMIT 10";
        $recent_bookings_stmt = $db->prepare($recent_bookings_query);
        $recent_bookings_stmt->execute();
        $stats['recent_bookings'] = $recent_bookings_stmt->fetchAll();
        
        // Recent users
        $recent_users_query = "SELECT name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10";
        $recent_users_stmt = $db->prepare($recent_users_query);
        $recent_users_stmt->execute();
        $stats['recent_users'] = $recent_users_stmt->fetchAll();
        
        // Car statistics by type
        $car_types_query = "SELECT type, COUNT(*) as count FROM cars GROUP BY type";
        $car_types_stmt = $db->prepare($car_types_query);
        $car_types_stmt->execute();
        $stats['car_types'] = $car_types_stmt->fetchAll();
        
        // Monthly revenue (last 6 months)
        $monthly_revenue_query = "SELECT 
                                    DATE_FORMAT(created_at, '%Y-%m') as month,
                                    SUM(amount) as revenue
                                 FROM payments 
                                 WHERE status = 'completed' 
                                 AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                                 GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                                 ORDER BY month DESC";
        $monthly_revenue_stmt = $db->prepare($monthly_revenue_query);
        $monthly_revenue_stmt->execute();
        $stats['monthly_revenue'] = $monthly_revenue_stmt->fetchAll();
        
        sendResponse(true, 'Admin dashboard data retrieved successfully', $stats, 200);
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
    }
    
} else {
    sendResponse(false, 'Method not allowed', null, 405);
}
?>