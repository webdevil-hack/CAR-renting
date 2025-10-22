# Rentify Car Rental Platform - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
cd /workspace
vercel

# Follow the prompts to configure your project
```

### Option 2: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect the configuration

## 🔧 Environment Variables

Set these in your Vercel project settings:

```
DB_HOST=your-database-host
DB_NAME=rentify
DB_USER=your-database-user
DB_PASS=your-database-password
JWT_SECRET=your-jwt-secret-key
```

## 📁 Project Structure

```
/workspace/
├── api/                    # Serverless PHP functions
│   ├── admin.php
│   ├── auth_*.php
│   ├── bookings.php
│   ├── cars.php
│   └── ...
├── frontend/              # Static frontend files
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── ...
├── vercel.json           # Vercel configuration
├── package.json          # Node.js dependencies
└── index.js             # Entry point
```

## 🗄️ Database Setup

1. Create a MySQL database using your preferred provider (PlanetScale, Railway, etc.)
2. Run the SQL schema from `sql/schema.sql`
3. Update environment variables in Vercel dashboard

## ✨ Features

- 🚗 Car rental booking system
- 👤 User authentication & profiles
- 🛠️ Admin dashboard
- 💳 Payment integration
- 📱 Responsive design
- 🔒 Secure API endpoints

## 🌐 Live Demo

Once deployed, your app will be available at:
`https://your-project-name.vercel.app`