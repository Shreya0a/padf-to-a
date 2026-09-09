const { spawn } = require('node:child_process');

/**
 * Runs a Python process, piping `text` to stdin. Resolves on exit 0,
 * rejects with a readable error otherwise.
 */
function runPython(python, args, text = '') {
  return new Promise((resolve, reject) => {
    const child = spawn(python, args, { windowsHide: true });

    let stderr = '';
    let stdout = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    child.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(
          new Error(`Python ('${python}') was not found. Install it to use this feature.`)
        );
      } else {
        reject(err);
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr.trim() || `Python exited with code ${code}`));
      }
    });

    child.stdin.on('error', () => {});
    if (text) child.stdin.write(text);
    child.stdin.end();
  });
}

module.exports = { runPython };
