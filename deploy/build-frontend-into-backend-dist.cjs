const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');

const projectRoot = path.join(__dirname, '..', '..');
const frontendDir = path.join(projectRoot, 'frontend');

const backendDist = path.join(__dirname, 'dist');

fs.mkdirSync(backendDist, { recursive: true });

console.log('Building frontend...');

// Build frontend.
// Best option across hosts: use the frontend package script directly via npm.
// execSync('npm run build') can be problematic in some restricted environments,
// but on Render/typical Linux it works; on Windows we can safely use cmd-less exec
// by running the npm JS entry with node.
const npmCliJs = path.join(frontendDir, 'node_modules', 'npm', 'bin', 'npm-cli.js');
const hasLocalNpmCli = fs.existsSync(npmCliJs);

let execNpmBuild;

// Prefer local Vite (no npm/cmd.exe required) to build for maximum host compatibility.
const viteBinJs = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');
const hasLocalVite = fs.existsSync(viteBinJs);

if (!hasLocalVite) {
    throw new Error(`Local vite not found at: ${viteBinJs}. Run: cd frontend && npm install`);
}

execNpmBuild = spawnSync(process.execPath, [viteBinJs, 'build'], {
    cwd: frontendDir,
    stdio: 'inherit',
    windowsHide: true,
    env: process.env,
});



if (execNpmBuild.error) throw execNpmBuild.error;
if (execNpmBuild.status !== 0) {
    throw new Error(`Frontend build failed with exit code ${execNpmBuild.status}`);
}



const frontendDistPath = path.join(frontendDir, 'dist');
if (!fs.existsSync(frontendDistPath)) {
    throw new Error(`Frontend build not found at: ${frontendDistPath}`);
}

console.log('Copying frontend dist -> backend/dist...');

for (const entry of fs.readdirSync(backendDist)) {
    fs.rmSync(path.join(backendDist, entry), { recursive: true, force: true });
}

const copyDirRecursive = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

copyDirRecursive(frontendDistPath, backendDist);

console.log('Done.');

