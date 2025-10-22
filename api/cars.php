<?php
require_once '../db.php';
require_once '../helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all cars with optional filters
    $filters = [];
    $params = [];
    
    // Build filter conditions
    if (isset($_GET['brand']) && !empty($_GET['brand'])) {
        $filters[] = "brand = :brand";
        $params[':brand'] = sanitizeInput($_GET['brand']);
    }
    
    if (isset($_GET['type']) && !empty($_GET['type'])) {
        $filters[] = "type = :type";
        $params[':type'] = sanitizeInput($_GET['type']);
    }
    
    if (isset($_GET['fuel_type']) && !empty($_GET['fuel_type'])) {
        $filters[] = "fuel_type = :fuel_type";
        $params[':fuel_type'] = sanitizeInput($_GET['fuel_type']);
    }
    
    if (isset($_GET['transmission']) && !empty($_GET['transmission'])) {
        $filters[] = "transmission = :transmission";
        $params[':transmission'] = sanitizeInput($_GET['transmission']);
    }
    
    if (isset($_GET['city']) && !empty($_GET['city'])) {
        $filters[] = "city LIKE :city";
        $params[':city'] = '%' . sanitizeInput($_GET['city']) . '%';
    }
    
    if (isset($_GET['min_price']) && !empty($_GET['min_price'])) {
        $filters[] = "price_per_day >= :min_price";
        $params[':min_price'] = floatval($_GET['min_price']);
    }
    
    if (isset($_GET['max_price']) && !empty($_GET['max_price'])) {
        $filters[] = "price_per_day <= :max_price";
        $params[':max_price'] = floatval($_GET['max_price']);
    }
    
    if (isset($_GET['seats']) && !empty($_GET['seats'])) {
        $filters[] = "seats >= :seats";
        $params[':seats'] = intval($_GET['seats']);
    }
    
    // Always filter by availability
    $filters[] = "is_available = 1";
    
    $where_clause = !empty($filters) ? 'WHERE ' . implode(' AND ', $filters) : '';
    
    // Sorting
    $order_by = 'ORDER BY created_at DESC';
    if (isset($_GET['sort'])) {
        $sort = sanitizeInput($_GET['sort']);
        switch ($sort) {
            case 'price_low':
                $order_by = 'ORDER BY price_per_day ASC';
                break;
            case 'price_high':
                $order_by = 'ORDER BY price_per_day DESC';
                break;
            case 'newest':
                $order_by = 'ORDER BY created_at DESC';
                break;
            case 'oldest':
                $order_by = 'ORDER BY created_at ASC';
                break;
        }
    }
    
    // Pagination
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 12;
    $offset = ($page - 1) * $limit;
    
    try {
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM cars $where_clause";
        $count_stmt = $db->prepare($count_query);
        foreach ($params as $key => $value) {
            $count_stmt->bindValue($key, $value);
        }
        $count_stmt->execute();
        $total = $count_stmt->fetch()['total'];
        
        // Get cars
        $query = "SELECT c.*, u.name as owner_name 
                  FROM cars c 
                  JOIN users u ON c.owner_id = u.id 
                  $where_clause 
                  $order_by 
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $cars = $stmt->fetchAll();
        
        // Parse images JSON
        foreach ($cars as &$car) {
            $car['images'] = json_decode($car['images'], true) ?: [];
        }
        
        $response_data = [
            'cars' => $cars,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_cars' => $total,
                'limit' => $limit
            ]
        ];
        
        sendResponse(true, 'Cars retrieved successfully', $response_data, 200);
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new car (owner only)
    $user = getCurrentUser();
    if (!$user || $user['role'] !== 'owner') {
        sendResponse(false, 'Unauthorized. Only car owners can add cars.', null, 403);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required_fields = ['title', 'brand', 'model', 'year', 'price_per_day', 'type', 'fuel_type', 'transmission', 'seats', 'city'];
    $errors = validateInput($input, $required_fields);
    
    if (!empty($errors)) {
        sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
    }
    
    try {
        $query = "INSERT INTO cars (owner_id, title, brand, model, year, price_per_day, type, fuel_type, transmission, seats, mileage, city, description, images) 
                  VALUES (:owner_id, :title, :brand, :model, :year, :price_per_day, :type, :fuel_type, :transmission, :seats, :mileage, :city, :description, :images)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':owner_id', $user['user_id']);
        $stmt->bindParam(':title', sanitizeInput($input['title']));
        $stmt->bindParam(':brand', sanitizeInput($input['brand']));
        $stmt->bindParam(':model', sanitizeInput($input['model']));
        $stmt->bindParam(':year', intval($input['year']));
        $stmt->bindParam(':price_per_day', floatval($input['price_per_day']));
        $stmt->bindParam(':type', sanitizeInput($input['type']));
        $stmt->bindParam(':fuel_type', sanitizeInput($input['fuel_type']));
        $stmt->bindParam(':transmission', sanitizeInput($input['transmission']));
        $stmt->bindParam(':seats', intval($input['seats']));
        $stmt->bindParam(':mileage', sanitizeInput($input['mileage'] ?? ''));
        $stmt->bindParam(':city', sanitizeInput($input['city']));
        $stmt->bindParam(':description', sanitizeInput($input['description'] ?? ''));
        $stmt->bindParam(':images', json_encode($input['images'] ?? []));
        
        if ($stmt->execute()) {
            $car_id = $db->lastInsertId();
            sendResponse(true, 'Car added successfully', ['car_id' => $car_id], 201);
        } else {
            sendResponse(false, 'Failed to add car', null, 500);
        }
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
    }
    
} else {
    sendResponse(false, 'Method not allowed', null, 405);
}
?>