const fs = require('fs');
const folders = [
    // 'node_modules',
    'dist', 
    '.parcel-cache'
];

for (const folder of folders) {
  fs.rmSync(folder, { recursive: true, force: true });
}
