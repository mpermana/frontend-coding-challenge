// generateData.js
const fs = require('fs');
const path = require('path');

const outputDir = 'data';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// --- USERS ---
const users = [];
for (let i = 1; i <= 10; i++) {
  users.push({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`
  });
}
fs.writeFileSync(path.join(outputDir, 'users.json'), JSON.stringify(users, null, 2));
console.log(`Generated ${users.length} users`);

// --- COLLECTIONS ---
const collections = [];
for (let i = 1; i <= 100; i++) {
  collections.push({
    id: i,
    name: `Collection #${i}`,
    descriptions: `Description for collection #${i}`,
    stocks: 100,
    price: 100,
    user_id: i % 10 // user 1 owns collection 1, user 2 owns collection 2, and so on, easy to see
  });
}
fs.writeFileSync(path.join(outputDir, 'collections.json'), JSON.stringify(collections, null, 2));
console.log(`Generated ${collections.length} collections`);

// --- BIDS ---
const bids = [];
let bidId = 1;
for (let collectionId = 1; collectionId <= 100; collectionId++) {
  for (let i = 1; i <= 10; i++) {
    bids.push({
      id: bidId++,
      collection_id: collectionId,
      price: 90 + i, // Static price: 91 to 100
      user_id: i, // User 1–10
      status: 'pending'
    });
  }
}
fs.writeFileSync(path.join(outputDir, 'bids.json'), JSON.stringify(bids, null, 2));
console.log(`Generated ${bids.length} bids`);
