require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const listUrl = [];
let index = 0;

app.post('/api/shorturl', (req, res) => {
  const { url: _url } = req.body;

  if (_url === "") {
    return res.json(
      {
        "error": "Invalid Url"
      }
    );
  }

  let parsed_url;
  const modified_url = _url.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/, '');

  try {
    parsed_url = new URL(_url);
  }
  catch (err) {
    return res.json(
      {
        "error": "Invalid Url"
      }
    );
  }

  dns.lookup(modified_url, (err) => {
    if (err) {
      return res.json(
        {
          "error": "Invalid Url"
        }
      );
    }
    else {
      const link_exists = listUrl.find(l => l.original_url === _url)

      if (link_exists) {
        return res.json(
          {
            "original_url": _url,
            "short_url": index
          }
        );
      }
      else {
        // increment for each new valid url
        ++index;

        // object creation for entry into url
        const url_object = {
          "original_url": _url,
          "short_url": `${index}`
        };

        // pushing each new entry into the array
        listUrl.push(url_object);

        // return the new entry created
        return res.json(
          {
            "original_url": _url,
            "short_url": index
          }
        );
      }
    }
  });
});


app.get('/api/shorturl/:index', (req, res) => {
  const { index: _id } = req.params;

  // finding if the id already exists
  const short_link = listUrl.find(sl => sl.short_url === _id);

  if (short_link) {
    return res.redirect(short_link.original_url);
  }
  else {
    return res.json(
      {
        "error": "Invalid Url"
      }
    );
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
