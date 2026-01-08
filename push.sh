#!/bin/bash
# Push to git and deploy to Vercel
set -e

echo "Pushing to git..."
git push

echo "Deploying to Vercel..."
cd /Users/joshua/Documents/Code/stonks/polymarket-terminal
vercel --prod --yes

echo "Done!"
echo "Live at: https://stonks-dashboard-orpin.vercel.app/"
