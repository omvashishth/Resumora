const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the build script (assumes npm run build is configured for production)
exec('npm run build', { cwd: process.cwd() }, (error, stdout, stderr) => {
  if (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
  console.log('Build completed.');
  // Locate the primary JS bundle (Vite outputs files with hash in name)
  const distDir = path.resolve(process.cwd(), 'dist');
  const files = fs.readdirSync(distDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  if (jsFiles.length === 0) {
    console.error('No JS bundle found in dist');
    process.exit(1);
  }
  // Find the smallest (initial) bundle file, typically the main entry
  const bundlePath = path.join(distDir, jsFiles[0]);
  const stats = fs.statSync(bundlePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`Initial bundle: ${jsFiles[0]} – ${sizeKB} KB (${stats.size} bytes)`);
});
