#!/usr/bin/env node
const { execSync } = require('child_process');

try {
    const result = execSync('node apply_fix.js', {
        cwd: 'c:\\Users\\fabia\\Desktop\\STARFORCE-Dark-Horizon',
        encoding: 'utf8',
        stdio: 'inherit'  // This will show output in real time
    });
} catch (err) {
    console.error('Execution failed:', err.message);
    process.exit(err.status || 1);
}
