import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles || [];
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
      }
    }
  });
  return arrayOfFiles;
}

const allFiles = [...getAllFiles('app'), ...getAllFiles('components')];
const regex = /t\(['"]([^'"]+)['"]\)/g;
const foundKeys = new Set();

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    foundKeys.add(match[1]);
  }
});

const langContext = fs.readFileSync('context/LanguageContext.tsx', 'utf-8');
const enDictStr = langContext.split('EN: {')[1].split('HINGLISH: {')[0];
const declaredKeysText = enDictStr.match(/['"][^'"]+['"]:/g) || [];
const declaredKeys = new Set(declaredKeysText.map(k => k.replace(/['":]/g, '').trim()));

const missingKeys = [];
foundKeys.forEach(k => {
  if (!declaredKeys.has(k)) {
    missingKeys.push(k);
  }
});

console.log('Missing Keys:', missingKeys);
