import fs from 'fs';
import path from 'path';

const versionInfo = { version: Date.now() };
const publicDir = './public';

if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'version.json'), JSON.stringify(versionInfo));
console.log(`[Build] version.json actualizado a: ${versionInfo.version}`);
