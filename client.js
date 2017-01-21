const path = require('path');
const child_process = require('child_process');
const request = require('request-promise');
const readline = require('readline');

const nw = require('nw').findpath();

request('http://localhost:6784/on/' + process.pid)
  .catch(() => {
    console.log('[tsc-tray] Server is not running, so launching it...');
    child_process.exec(nw + ' ' + __dirname + ' ' + process.pid);
  })
  .finally(start);

function start() {
  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  reader.on('line', (line) => {
    console.log(line);
    if (/File change detected. Starting incremental compilation/.test(line)) {
      request('http://localhost:6784/on/' + process.pid);
    }
    if (/Compilation complete. Watching for file changes/.test(line)) {
      request('http://localhost:6784/off/' + process.pid);
    }
    if (/: error/.test(line)) {
      request('http://localhost:6784/error/' + process.pid);
    }
  });
}

function quit() {
  request('http://localhost:6784/quit/' + process.pid);
}

process.on('exit', () => quit());
process.on('SIGINT', () => quit());
process.on('SIGTERM', () => quit());
