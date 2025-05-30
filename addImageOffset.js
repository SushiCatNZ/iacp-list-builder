const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'cards.json');
const cards = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const updated = cards.map(card => ({
  ...card,
  ImageOffset: card.ImageOffset !== undefined ? card.ImageOffset : 0
}));

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
console.log('Added ImageOffset: 0 to all cards in cards.json');