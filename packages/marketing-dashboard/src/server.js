#!/usr/bin/env node
/**
 * Protein Empire Marketing Dashboard Server
 * 
 * A simple HTTP server to serve the marketing dashboard.
 * In production, this would be replaced with a proper backend.
 * 
 * Usage:
 *   node packages/marketing-dashboard/src/server.js
 *   
 * Then open http://localhost:3000
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Handle API routes
  if (req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

/**
 * Handle API requests
 */
function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // API routes
  switch (url.pathname) {
    case '/api/metrics':
      res.writeHead(200);
      res.end(JSON.stringify({
        users: { value: 12500, change: 11.6 },
        signups: { value: 375, change: 17.2 },
        downloads: { value: 340, change: 17.2 },
        engagement: { value: 8200, change: 24.5 }
      }));
      break;

    case '/api/sites':
      res.writeHead(200);
      res.end(JSON.stringify(getSitesData()));
      break;

    case '/api/traffic':
      res.writeHead(200);
      res.end(JSON.stringify(getTrafficData()));
      break;

    case '/api/recipes':
      res.writeHead(200);
      res.end(JSON.stringify(getTopRecipes()));
      break;

    case '/api/calendar':
      res.writeHead(200);
      res.end(JSON.stringify(getCalendarData()));
      break;

    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
  }
}

/**
 * Get sites data
 */
function getSitesData() {
  return [
    { domain: 'proteincookies.co', name: 'Protein Cookies', foodType: 'cookies', recipes: 25, subscribers: 450 },
    { domain: 'proteinbrownies.co', name: 'Protein Brownies', foodType: 'brownies', recipes: 22, subscribers: 380 },
    { domain: 'proteinpancakes.co', name: 'Protein Pancakes', foodType: 'pancakes', recipes: 20, subscribers: 320 },
    { domain: 'proteinmuffins.com', name: 'Protein Muffins', foodType: 'muffins', recipes: 18, subscribers: 290 },
    { domain: 'proteinbars.co', name: 'Protein Bars', foodType: 'bars', recipes: 15, subscribers: 250 },
    { domain: 'proteinbites.co', name: 'Protein Bites', foodType: 'bites', recipes: 15, subscribers: 220 },
    { domain: 'proteinoatmeal.co', name: 'Protein Oatmeal', foodType: 'oatmeal', recipes: 12, subscribers: 180 },
    { domain: 'proteincheesecake.co', name: 'Protein Cheesecake', foodType: 'cheesecake', recipes: 10, subscribers: 150 },
    { domain: 'proteindonuts.co', name: 'Protein Donuts', foodType: 'donuts', recipes: 10, subscribers: 140 },
    { domain: 'proteinpizzas.co', name: 'Protein Pizzas', foodType: 'pizzas', recipes: 8, subscribers: 120 },
    { domain: 'proteinpudding.co', name: 'Protein Pudding', foodType: 'pudding', recipes: 8, subscribers: 100 },
    { domain: 'protein-bread.com', name: 'Protein Bread', foodType: 'bread', recipes: 6, subscribers: 80 }
  ];
}

/**
 * Get traffic data
 */
function getTrafficData() {
  return {
    bySite: [
      { site: 'proteincookies.co', sessions: 3200 },
      { site: 'proteinbrownies.co', sessions: 2800 },
      { site: 'proteinpancakes.co', sessions: 2400 },
      { site: 'proteinmuffins.com', sessions: 2100 },
      { site: 'proteinbars.co', sessions: 1800 },
      { site: 'proteinbites.co', sessions: 1500 },
      { site: 'proteinoatmeal.co', sessions: 1200 },
      { site: 'proteincheesecake.co', sessions: 1100 },
      { site: 'proteindonuts.co', sessions: 900 },
      { site: 'proteinpizzas.co', sessions: 850 },
      { site: 'proteinpudding.co', sessions: 500 },
      { site: 'protein-bread.com', sessions: 400 }
    ],
    bySource: [
      { source: 'Organic Search', sessions: 9375, percent: 50 },
      { source: 'Pinterest', sessions: 4688, percent: 25 },
      { source: 'Direct', sessions: 2813, percent: 15 },
      { source: 'Social', sessions: 1125, percent: 6 },
      { source: 'Referral', sessions: 750, percent: 4 }
    ]
  };
}

/**
 * Get top recipes
 */
function getTopRecipes() {
  return [
    { title: 'Classic Protein Cookies', site: 'proteincookies.co', views: 4520, signups: 156, rate: 3.45 },
    { title: 'Fudgy Protein Brownies', site: 'proteinbrownies.co', views: 3890, signups: 142, rate: 3.65 },
    { title: 'Fluffy Protein Pancakes', site: 'proteinpancakes.co', views: 3210, signups: 98, rate: 3.05 },
    { title: 'Blueberry Protein Muffins', site: 'proteinmuffins.com', views: 2850, signups: 87, rate: 3.05 },
    { title: 'No-Bake Protein Bars', site: 'proteinbars.co', views: 2340, signups: 76, rate: 3.25 }
  ];
}

/**
 * Get calendar data
 */
function getCalendarData() {
  const now = new Date();
  const items = [];
  
  // Generate sample calendar items for the month
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Add newsletter on Sundays
    if (date.getDay() === 0) {
      items.push({
        date: date.toISOString().split('T')[0],
        time: '10:00',
        type: 'email',
        title: 'Weekly Newsletter',
        site: 'all'
      });
    }
    
    // Add social posts on Mon/Thu
    if (date.getDay() === 1 || date.getDay() === 4) {
      items.push({
        date: date.toISOString().split('T')[0],
        time: '14:00',
        type: 'social',
        title: 'Pinterest Pins',
        site: 'proteincookies.co'
      });
    }
  }
  
  return items;
}

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🏰 Protein Empire Marketing Dashboard               ║
║                                                       ║
║   Server running at http://localhost:${PORT}            ║
║                                                       ║
║   Press Ctrl+C to stop                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});
