const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

(async () => {
  try {
    const { stdout, stderr } = await execPromise('git checkout script/gameLoop.js', {
      cwd: 'c:\\Users\\fabia\\Desktop\\STARFORCE-Dark-Horizon'
    });
    console.log('File restored from git');
    console.log(stdout);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
