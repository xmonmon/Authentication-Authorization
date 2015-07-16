// require express framework and additional modules

var express = require('express'),
  app = express(),
  ejs = require('ejs'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  User = require('./models/user'),
  session = require('express-session');

 // connect to mongodb
mongoose.connect('mongodb://localhost/test');

// set view engine for server-side templating
app.set('view engine', 'ejs');

// middleware - this is what talks to each server and makes it work
app.use(bodyParser.urlencoded({extended: true}));

//set the new middleware session options
app.use(session({
	saveUninitialized: true,
	resave: true,
	secret: 'SuperSecretCookie',
	cookie: { maxAge: 60000 }
}));

// signup route with placeholder response
app.get('/signup', function (req, res) {
  res.send('coming soon');
});

// app.get('/profile', function (req, res) {
// 	// then find the user that is currently logged in
// 	req.currentUser(function (err, user){
// 		res.send('Welcome' + user.email);
// 	});
// });

// login route (renders login view)
app.get('/login', function (req, res) {
  res.render('login');
});

// user submits the signup form
app.post('/users', function (req, res) {

  // grab user data from params (req.body)
  var newUser = req.body.user;

  // create new user with secure password
User.createSecure(newUser.email, newUser.password, function (err, user) {
    res.send(user);
  });
});

app.get('/profile', function (req, res) {
	// then find the user that is currently logged in
	req.currentUser(function (err, user){
		res.send('Welcome' + user.email);
	});
});

// user submits the login form
app.post('/login', function (req, res) {

  // grab user data from params (req.body)
  var userData = req.body.user;

  // call authenticate function to check if password user entered is correct
  User.authenticate(userData.email, userData.password, function (err, user) {
    // saves user id to session
    req.login(user);

    // redirect to user profile
    //trying this (line77) found online
    // req.session.user_id = user.id;
    res.redirect('/profile');
  });
});

//the middleware to manage the sessions above

app.use('/', function (req, res, next){
	// now this saves the userId in the session for the logged-in user
	req.login = function (user) {
		req.session.userId = user.id;
	};
	// now this will find the user that is currently logged in based on the 'session.userId'
	req.currentUser = function (callback) {
		User.findOne({_id: req.session.userId}, function (err, user) {
			req.user = user;
			callback(null, user);
		});
	};

	//now, destroy 'session.userId' to log out the user
	req.logout = function () {
		req.session.userId = null;
		req.user = null;
	};

	next();
});



// listen on port 3000
app.listen(3000, function () {
  console.log('server started on locahost:3000');
});