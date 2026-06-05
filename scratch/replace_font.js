const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the Google Font link
content = content.replace('family=Outfit', 'family=Be+Vietnam+Pro');

// Replace all fontFamily references
content = content.replaceAll("'Outfit'", "'Be Vietnam Pro'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced Outfit with Be Vietnam Pro!');
