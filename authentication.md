# Adding Logging and Authentication to Your Wiki

## Adding logging to your Wiki

Add a logging middleware to your wiki. It should log the request method and url to the console, optionally to a log file as well.

## Adding Authentication to your Wiki

### Step 1

Lock down editing of your wiki by adding a middleware handler function - you may call it authRequired or anything else - in front of the URL patterns /:pageName/edit and /:pageName/save. This middleware handler will only call the next() function to execute the next handler in the chain if request.session.user exists - i.e. there is a logged in user. If the user hasn't been logged in, you will redirect to /login the You will need to setup the express-session module - see auth-login-middleware.js example.

### Step 2: Create the login page

Create a login page. You will create a login.hbs in the views folder and use response.render to render that page as usual. The login page will have a form, and it will have a type input for the username and a password input for the password. The form's action attribute will be /login-submit and method will be POST - you will write the handler for this in the next step.

### Step 3: Handling the login

Create a handler for the POST method of the URL /login-submit: i.e. app.post('/login-submit', ...). You will check the form params from the login form to see if it was a valid login. To keep things simple, you will just write an if statement or 2 to check for specific username and password combinations, such as:

if (request.body.username === 'Toby' &&
  request.body.password === 'thepassword') {
  // login succeed!
}

If the password validates, you will redirect back to /, else redirect back to /login

### Step 4: Redirect back to intended URL

If the user is redirected to the login page because he tried to edit a page, redirecting him to the front page is not the nicest thing to do. It would be nicer to redirect him back to the place he intended to go. You will do this using ... (drum roll please) ...

Sessions!

In your authRequired function, when the user is not present and the request is redirected to the login page, just before you redirect him, you will store the URL of the current request - the place he intended to go - to the session: request.session.requestUrl = request.url

Then, in the /login-submit handler, when the login is successful, instead of redirecting him back to the root /, you will redirect him to request.session.requestUrl, which is now saved in the session.
