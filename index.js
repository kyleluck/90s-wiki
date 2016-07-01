var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var wikiLinkify = require('wiki-linkify'); //module to autolink CamelCased words
var marked = require('marked'); //module to parse markdown format
var session = require('express-session');

var app = express();

app.set('view engine', 'hbs'); //hbs view engine
app.use('/static', express.static(__dirname + '/public')); //serve public directory
app.use(session({ secret: '90s&wiki$secret', cookie: {
  maxAge: 1000000
}})); //use express session for user authentication
app.use(bodyParser.urlencoded({ extended: false })); //use body parser for requests

// log all requests
app.use(function(request, response, next) {
  var logItem = request.method + ' ' + request.url + '\n\n';
  fs.appendFile('requests.log', logItem, function(err) {
    if (err) {
      return console.log('Error writing to log file:', err);
    }
  });
  console.log(request.method + ' ' + request.url);
  next();
});

app.get('/', function(req, res) {
  res.redirect('/HomePage');
});

//display all pages created at /AllPages
app.get('/AllPages', function(req, res) {
  fs.readdir('pages', function(err, files) {
    if (err) {
      return console.log('Error reading pages directory: ', err);
    }

    //change files to remove extension and create link
    files = files.map(function(file) {
      var fileName = file.slice(0, -3);
      return '<a href="/' + fileName + '">' + fileName + '</a>';
    });

    res.render('allpages', {
      title: 'AllPages',
      pageName: 'AllPages',
      files: files
    });
  });
});

//display login page
app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/:pageName', function(req, res) {
  var pageName = req.params.pageName,
      pageContent,
      pageFileLocation = 'pages/' + pageName + '.md';

  //just return if the request is for a dumb favicon
  if (pageName === 'favicon.ico') {
    return;
  }

  //check to see if file exists
  fs.access(pageFileLocation, function(err) {
    //if file doesn't exist, render placeholder page
    if (err) {
      res.render('placeholder', {
        title: pageName,
        pageName: pageName,
      });
      return;
    }

    //if file exists, read file contents and render page
    fs.readFile(pageFileLocation, function(err, data) {
      if (err) {
        return console.log('There was an error reading the file: ', err);
      }

      pageContent = data.toString();
      //convert markdown to html
      pageContent = marked(pageContent);
      //wikiLinkify any CamelCased words
      var wikiContent = wikiLinkify(pageContent);

      res.render('page', {
        title: pageName,
        pageName: pageName,
        content: wikiContent
      });
    });

  });
});

app.get('/:pageName/edit', authRequired, function(req, res) {
  var pageName = req.params.pageName;
  var pageFileLocation = 'pages/' + pageName + '.md';
  var currentContent;

  fs.readFile(pageFileLocation, function(err, data) {
    if (err) {
      currentContent = '';
    } else {
      currentContent = data.toString();
    }
    res.render('edit', {
      title: 'Edit ' + pageName,
      pageName: pageName,
      currentContent: currentContent
    });
  });

});

app.post('/:pageName/save', authRequired, function(req, res) {
  var pageContent = req.body.pageContent;
  var thisPage = req.params.pageName;
  var pageLocation = 'pages/' + thisPage + '.md';

  fs.writeFile(pageLocation, pageContent, function(err) {
    if (err) {
      return console.log('There was an error: ', err);
    }
    console.log(pageLocation + " written successfully");
  });

  res.redirect('/' + thisPage);
});

//handle login request
app.post('/login-submit', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  //hard code because this is just an exercise:
  if ((username === 'kyle' && password === 'thepassword') || username === 'admin' && password === 'letmein') {
    //user authenticated
    req.session.user = username; //assign username to session object
    res.redirect(req.session.requestUrl);
  } else {
    res.redirect('/login');
  }
});

//function to see if user is logged in
function authRequired(req, res, next) {
  if (!req.session.user) {
    req.session.requestUrl = req.url; //assign requestURL to session object
    res.redirect('/login');
    return;
  }
  next();
}

//listen on port 3000
app.listen('3000', function() {
  console.log('Listening on port 3000');
});
