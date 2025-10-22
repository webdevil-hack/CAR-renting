const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'rentify',
  charset: 'utf8mb4'
};

const JWT_SECRET = process.env.JWT_SECRET || 'rentify_secret_key_2024';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json'
};

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    if (req.method === 'GET') {
      // Get user's bookings
      const user = verifyToken(req);
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const [rows] = await connection.execute(
        `SELECT b.*, c.make, c.model, c.year, c.image_url 
         FROM bookings b 
         JOIN cars c ON b.car_id = c.id 
         WHERE b.user_id = ? 
         ORDER BY b.created_at DESC`,
        [user.id]
      );

      res.status(200).json({
        success: true,
        data: rows
      });

    } else if (req.method === 'POST') {
      // Create new booking
      const user = verifyToken(req);
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { car_id, start_date, end_date, total_amount } = req.body;

      if (!car_id || !start_date || !end_date || !total_amount) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
        return;
      }

      // Check if car is available
      const [carRows] = await connection.execute(
        'SELECT * FROM cars WHERE id = ? AND status = "available"',
        [car_id]
      );

      if (carRows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Car not available'
        });
        return;
      }

      // Create booking
      const [result] = await connection.execute(
        'INSERT INTO bookings (user_id, car_id, start_date, end_date, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, "pending", NOW())',
        [user.id, car_id, start_date, end_date, total_amount]
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          user_id: user.id,
          car_id,
          start_date,
          end_date,
          total_amount,
          status: 'pending'
        }
      });

    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    await connection.end();
  } catch (error) {
    console.error('Bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}