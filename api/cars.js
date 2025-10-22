const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'rentify',
  charset: 'utf8mb4'
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json'
};

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
      // Get all cars
      const [rows] = await connection.execute(
        'SELECT * FROM cars WHERE status = "available" ORDER BY created_at DESC'
      );
      
      res.status(200).json({
        success: true,
        data: rows
      });
    } else if (req.method === 'POST') {
      // Add new car (admin only)
      const { make, model, year, price_per_day, description, image_url } = req.body;
      
      const [result] = await connection.execute(
        'INSERT INTO cars (make, model, year, price_per_day, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?, "available")',
        [make, model, year, price_per_day, description, image_url]
      );
      
      res.status(201).json({
        success: true,
        data: { id: result.insertId, make, model, year, price_per_day, description, image_url }
      });
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    await connection.end();
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}