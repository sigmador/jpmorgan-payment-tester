#!/bin/bash

echo "🚀 Setting up JPMorgan Payments API Tester..."
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your JPMorgan API credentials"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Edit .env with your API credentials"
echo "  2. Run 'npm run dev' to start the backend"
echo "  3. In another terminal, run 'cd client && npm start' for the frontend"
echo ""
echo "Or for production:"
echo "  1. Run 'npm run build:client'"
echo "  2. Run 'NODE_ENV=production npm start'"
echo ""
