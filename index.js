require('dotenv').config();
const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const path = require('path');
// const args = process.argv || [];
// const test = args.some(arg => arg.includes('jasmine'));

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
 console.log('DATABASE_URI not specified');
}
const config = {
  databaseURI: databaseUri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY,
  serverURL: process.env.SERVER_URL, // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Checklist'], // List of classes to support for query subscriptions
  },
};

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
// if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
// }

app.get('/', function (req, res) {
  res.status(200).send('Добро Пожаловать в Eco Balance Life');
  // res.sendFile(path.join(__dirname, '/public/test.html'));
});



const port = process.env.PORT || 1337;
// if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('EcoApp running on port ' + port + '.');
  });
  // ParseServer.createLiveQueryServer(httpServer);
// }

module.exports = {
  app,
  config,
};
