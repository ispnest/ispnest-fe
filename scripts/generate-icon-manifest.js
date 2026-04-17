const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../node_modules/lucide-static/icons');
const outputFile = path.join(iconDir, 'manifest.json');

try {
  const files = fs.readdirSync(iconDir)
    .filter(file => file.endsWith('.svg'))
    .map(file => file.replace('.svg', ''));

  fs.writeFileSync(outputFile, JSON.stringify(files));
  console.log(`✅ Icon manifest generated: ${files.length} icons found.`);
} catch (err) {
  console.error('❌ Error generating icon manifest:', err.message);
}
