import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const DASH_REGEX = /[\u2012\u2013\u2014\u2015\u2212]/g;

walkDir(path.join(__dirname, 'src'), function (filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.match(DASH_REGEX)) {
            content = content.replace(DASH_REGEX, '-');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated dashes: ' + filePath);
        }
    }
});
console.log('Done dashes.');
