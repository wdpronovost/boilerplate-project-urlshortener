require('dotenv').config();
const dns = require('node:dns');
const url = require('node:url');
const util = require('util');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const Database = require("@replit/database")


// Repl.it DB connection
const db = new Database()
const options = {
    all:true,
};

// db.list().then(function (keys) {
//     let length = keys.length
//   console.log(length)
//   for (let i = 0; i < length; i++) {
//     db.delete(keys[i]).then(() => {});    
//   }

//   console.log(keys)
// })

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Post route
app.post('/api/shorturl', async function (req, res) {
    //const regex = /HTTPS?:\/\//i;
    let nextKey = await db.list().then(keys => keys.length);
    let url = await req.body.url
    console.log(url)
    let urlObject = new URL(url)
    //let dnsURL = url.replace(regex, "")
    console.log(`urlObject: ${JSON.stringify(urlObject)}`)
    dns.lookup(urlObject.hostname, function (err, address) {
      if (err) {
        res.json({error: 'invalid url'})
      } else {
        console.log(`isValidUrl: ${url}`)
        db.set(nextKey, url).then(() => {})
        res.json({ original_url : url , short_url : nextKey})
      }  
    })  
})

app.get('/api/shorturl/:shorturl', async function (req, res) {
  let isValidShortURL = await db.get(req.params.shorturl)
  console.log(`isValidShortURL: ${isValidShortURL}`)
  if (isValidShortURL) {
    res.redirect(isValidShortURL)
  } else {
    res.json({"error":"No short URL found for the given input"})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
