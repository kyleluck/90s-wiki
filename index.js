var express = require('express');
var bodyParser = require('body-parser');
var wikiLinkify = require('wiki-linkify'); //module to autolink CamelCased words
var marked = require('marked'); //module to parse markdown format
var session = require('express-session');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/wiki'); //connect to mongoose db on localhost (wiki db)

var app = express();

app.set('view engine', 'hbs'); //hbs view engine
app.use('/static', express.static(__dirname + '/public')); //serve public directory
app.use(session({ secret: '90s&wiki$secret', cookie: {
  maxAge: 1000000
}})); //use express session for user authentication
app.use(bodyParser.urlencoded({ extended: false })); //use body parser for requests

// mongo model for wiki entries
var Page = mongoose.model('Page', {
  _id: { type: String, required: true },
  content: { type: String, required: true }
});

// mongo model for logging
var Log = mongoose.model('Log', {
  log: String,
  timestamp: Date
});

// mongo model for user
var User = mongoose.model('User', {
  username: { type: String, required: true },
  password: { type: String, required: true }
});

// log all requests
app.use(function(request, response, next) {

  // create the new Log object
  var logItem = new Log({
    log: request.method + ' ' + request.url,
    timestamp: Date.now()
  });

  // save it to the database
  logItem.save(function(err, response) {
    if (err) {
      return console.error(err);
    }
  });

  next();
});


app.get('/', function(req, res) {
  res.redirect('/HomePage');
});

//display all Pages created at /AllPages
app.get('/AllPages', function(req, res) {
  //get a list of Pages from the database
  Page.find(function(err, response) {
    if (err) {
      return console.error(err);
    }
    res.render('allpages', {
      title: 'AllPages',
      pageName: 'AllPages',
      files: response
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

  //check to see if this page already exists in the db
  Page.findOne({ _id: pageName }, function(err, page) {
    if (err) {
      return console.error(err);
    }
    if (!page) {
      //page doesn't exist, render placeholder
      res.render('placeholder', {
        title: pageName,
        pageName: pageName,
      });
    } else {
      /* page exists, render it */
      //convert markdown to html
      var pageContent = marked(page.content);
      //wikiLinkify any CamelCased words
      var wikiContent = wikiLinkify(pageContent);
      res.render('page', {
        title: pageName,
        pageName: pageName,
        content: wikiContent
      });
    }
  });
});

app.get('/:pageName/edit', authRequired, function(req, res) {
  var pageName = req.params.pageName;
  var pageFileLocation = 'pages/' + pageName + '.md';
  var currentContent;

  //if the page has content, show it in the edit textarea
  Page.findOne({ _id: pageName }, function(err, page) {
    if (err) {
      return console.error(err);
    }
    if (!page) {
      currentContent = '';
    } else {
      currentContent = page.content;
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

  //save or update this page in the database
  Page.findOneAndUpdate(
    { _id: thisPage },
    { $set: { content: pageContent }},
    { upsert: true },
    function(err, response) {
      if (err) {
        return console.error(err);
      }
      res.redirect('/' + thisPage);
    }
  );
});

//handle login request
app.post('/login-submit', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  //check username & password against database
  /* ok, we know not to store passwords unencryped in databases and
    that findOne wouldn't work if there were multiple users with the
    same username */
  User.findOne({ username: username }, function(err, user) {
    if (err) {
      console.error(err);
    }
    if (user.username === username && user.password === password) {
      //user authenticated
      req.session.user = username; //assign username to session object
      res.redirect(req.session.requestUrl);
    } else {
      //user NOT authenticated
      res.redirect('/login');
    }
  });
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
