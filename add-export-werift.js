const fs = require('fs');
const path = require('path');

const indexFilePath = path.join(
  __dirname,
  'node_modules',
  'werift',
  'lib/webrtc/src',
  'index.d.ts',
);

if (!fs.existsSync(indexFilePath)) {
  console.error(`index.d.ts file does not exist at path: ${indexFilePath}`);
  process.exit(1);
}

const exportLine = 'export * from "./nonstandard";\n';

fs.readFile(indexFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }

  if (data.includes(exportLine)) {
    console.log('Export line already exists in the file.');
  } else {
    const updatedData = data + exportLine;

    fs.writeFile(indexFilePath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file: ${err.message}`);
        process.exit(1);
      }
      console.log('Export line successfully added to index.d.ts');
    });
  }
});
