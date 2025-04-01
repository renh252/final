const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'app', 'api', 'forum', 'posts', '[id]', 'comments', 'route.js'),
  path.join(__dirname, '..', 'app', 'api', 'forum', 'posts', '[id]', 'route.js')
];

files.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Deleted: ${file}`);
    } else {
      console.log(`File not found: ${file}`);
    }
  } catch (err) {
    console.error(`Error deleting ${file}:`, err);
  }
});
