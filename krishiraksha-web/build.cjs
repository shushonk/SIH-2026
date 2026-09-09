const fs = require('fs');
const cp = require('child_process');
const path = require('path');

console.log('Starting KrishiRaksha Vercel build script...');
console.log('Current working directory:', process.cwd());

if (fs.existsSync(path.join(process.cwd(), 'krishiraksha-web', 'package.json'))) {
  console.log('Detected monorepo root. Building krishiraksha-web...');
  cp.execSync('cd krishiraksha-web && npm install && npm run build', { stdio: 'inherit' });
  
  // Mirror dist to root dist as well so Vercel can find it at either output path
  try {
    const srcDist = path.join(process.cwd(), 'krishiraksha-web', 'dist');
    const targetDist = path.join(process.cwd(), 'dist');
    if (fs.existsSync(srcDist)) {
      fs.cpSync(srcDist, targetDist, { recursive: true });
      console.log('Mirrored dist to root ./dist successfully.');
    }
  } catch (e) {
    console.warn('Could not mirror dist folder (optional):', e.message);
  }
} else {
  console.log('Detected krishiraksha-web directory. Building Vite app...');
  cp.execSync('npx vite build', { stdio: 'inherit' });
}

console.log('Build completed successfully!');
