const express = require('express');
require('../db/mongoose')
const nanoid = require('nanoid');
const validUrl = require('valid-url');
const { UrlModel } = require('../models/urlModel')

const Url = UrlModel;

const app = express();
app.use(express.json())
app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('pages/index');
});

// Post request endpoint to get and store shortened URL
app.post('/shorten', (req, res) => {
  if (req.body.url) {
    if (validUrl.isUri(req.body.url)) {
      const uid = nanoid.nanoid(8);
      const url = 'http://localhost:3000/u/' + uid;
      const newUrl = new Url({
        longUrl: req.body.url,
        shortUrl: url,
        userId: '00000',
        clicks: 0,
      })
        newUrl.save()
        .then((_) => {
          res.send({
            originalURL: req.body.url,
            shortenedURL: url,
            code: 200,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.send({
        message: 'Invalid URL',
        code: 400,
      });
    }
  } else {
    res.send({
      message: 'Incorrect request',
      code: 400,
    });
  }
});

// Redirect endpoint (short to long url)
app.get('/u/:id', (req, res) => {
  Url.findOne(
    { shortUrl: 'http://localhost:3000/u/' + req.params.id },
    (err, url) => {
      if (err) {
        res.send('Server error');
      } else if (!url) {
        res.send('Invalid URL');
      } else {
        Url.findOneAndUpdate(
          { shortUrl: 'http://localhost:3000/u/' + req.params.id },
          { clicks: url.clicks + 1 },
          { useFindAndModify: false },
          (err, _) => {
            if (err) {
              res.send('Server error');
            } else {
              res.redirect(url.longUrl);
            }
          }
        );
      }
    }
  );
});

app.listen(3000, () => {
  console.log('App running on port 3000');
});
