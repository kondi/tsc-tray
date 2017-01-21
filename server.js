const gui = require('nw.gui');
const express = require('express')

const app = express();

const menu = new nw.Menu();
menu.append(new nw.MenuItem({
  label: 'Exit',
  click: () => {
    gui.App.quit();
  }
}));

const tray = new gui.Tray({
  title: 'TypScript tray',
  menu
});

process.on('exit', () => tray.remove());
process.on('SIGINT', () => tray.remove());
process.on('SIGTERM', () => tray.remove());

gui.Window.get().on('close', () => tray.remove());
gui.Window.get().on('closed', () => tray.remove());

function setProgress() { tray.icon = 'assets/hour-glass.png'; }
function setDone() { tray.icon = 'assets/checkmark.png'; }
function setError() { tray.icon = 'assets/notification.png'; }

setDone();

const pending = new Set();
const errors = new Set();
const clients = new Set();

app.get('/quit/:id', (req, res) => {
  clients.delete(req.params.id);
  if (!clients.size) {
    gui.App.quit();
  }
  res.send(true);
});

app.get('/on/:id', (req, res) => {
  clients.add(req.params.id);
  pending.add(req.params.id);
  errors.delete(req.params.id);
  setProgress();
  res.send(Array.from(pending));
});

app.get('/off/:id', (req, res) => {
  pending.delete(req.params.id);
  if (!pending.size) {
    if (errors.size) {
      setError();
    } else {
      setDone();
    }
  }
  res.send(Array.from(pending));
});

app.get('/error/:id', (req, res) => {
  errors.add(req.params.id);
  res.send(Array.from(errors));
});

const argv = gui.App.argv;
if (argv.length) {
  pending.add(argv[0]);
  clients.add(argv[0]);
  setProgress();
}

app.listen(6784, function() {
  console.log('Example app listening on port 6784!')
});
