const { execSync } = require('child_process');
const path = require('path');

try {
    // Change to the working directory and run the remove_wingman.js script
    const result = execSync('node remove_wingman.js', {
        cwd: 'c:\\Users\\fabia\\Desktop\\STARFORCE-Dark-Horizon',
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log('STDOUT:');
    console.log(result);
} catch (err) {
    console.log('STDERR:');
    console.log(err.stderr || err.message);
    console.log('STDOUT:');
    console.log(err.stdout || '');
}
