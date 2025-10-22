#!/bin/bash

echo "🚀 Deploying Rentify Car Rental Platform to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    echo "Run: vercel login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Vercel CLI ready"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --yes

echo ""
echo "🎉 Deployment complete!"
echo "Your app will be available at the URL shown above."
echo ""
echo "📝 Don't forget to:"
echo "1. Set up your database"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Import the database schema from sql/schema.sql"