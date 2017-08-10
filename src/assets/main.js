const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const open = require("open");

const port = 3001;

const express = require('express')
const expressApp = express();
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser')

var server;

expressApp.use(express.static(__dirname.replace('\\assets', '')))

expressApp.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

expressApp.use( bodyParser.json() );       // to support JSON-encoded bodies
expressApp.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

expressApp.get('/generate_hash/:password', function (req, res) {
  var password = req.params.password;
  res.send(bcrypt.hashSync(password));
});

expressApp.post('/verify_password', function (req, res) {
  var password = req.body.password;
  var hash = req.body.hash;
  var match = bcrypt.compareSync(password, hash);
  if(match) {
    res.send('match');
  } else {
    res.send('nomatch');
  }
});

function runServer() {
  server = expressApp.listen(port, function () {
      console.log('Server is running on port: ' + port);
  });
};

function closeServer() {
  if(server) {
      server.close(function() { console.log('Server stopped'); })
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
      width: 1000,
      height: 600,
      title: 'Geronimo',
      backgroundColor: '#76a4ed'
  });
  mainWindow.maximize();

  mainWindow.loadURL('http://localhost:'+port);

  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    closeServer();
    mainWindow = null
  });

  mainWindow.webContents.on('will-navigate', onNewPage);
  mainWindow.webContents.on('new-window', onNewPage);
}

function onNewPage(e, url) {
  if (url.search('http://localhost:'+port) === -1 &&
    url.search(/(oauth|sign_in)/) === -1 &&
    url.search(/^blob:/) === -1) {

    e.preventDefault();
    return open(url);
  }
}

app.on('ready', function() {
  runServer();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    closeServer();
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
