const { spawn } = require('child_process');

const port = process.env.PORT || '3000';
const swaggerPath = process.env.SWAGGER_PATH || 'docs';
const swaggerUrl = `http://localhost:${port}/${swaggerPath}`;

function openUrl(url) {
  let command;
  let args;

  if (process.platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();
}

openUrl(swaggerUrl);