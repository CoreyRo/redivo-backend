'use strict'

const express = require('express');
const exphbs = require('express-handlebars')
const methodOverride = require("method-override");
const path = require('path');
const fs = require('fs');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator')
const mongoose = require('mongoose')
const db = require("./models")
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const env = require('dotenv').load();
const app = express();
const PORT = process.env.PORT || 3000
const { _ } =require('underscore')


// Set up promises with mongoose
mongoose.Promise = global.Promise;
// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_LOCALHOST || process.env.MONGODB_URI || process.env.MONGO_MLAB)

// When successfully connected
mongoose.connection.on('connected', function () {  
  console.log(`Mongoose default connection open to ${process.env.MONGODB_LOCALHOST || process.env.MONGODB_URI || process.env.MONGO_MLAB}`);
}); 
// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log(`Mongoose default connection error: ${err}`);
}); 
// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});
// If the Node process ends, close the Mongoose connection 
// process.on('SIGINT', function() {  
// 	mongoose.connection.close(function () { 
// 	  console.log('Mongoose default connection disconnected through app termination'); 
// 	  process.exit(0); 
// 	}); 
// }); 


// ******************************************************************************
// *** setup express-handlebars instance
// ==============================================================================
var hbs = exphbs.create({
	defaultLayout:'main',
  	// Specify helpers which are only registered on this instance.
  	helpers: {
		foo: function () { return 'FOO!'; },
		bar: function () { return 'BAR!'; },
		everyNth: function(context, every, options){
			var fn = options.fn, inverse = options.inverse;
			var ret = "";
			if(context && context.length > 0) {
			  for(var i=0, j=context.length; i<j; i++) {
				var modZero = i % every === 0;
				ret = ret + fn(_.extend({}, context[i], {
				  isModZero: modZero,
				  isModZeroNotFirst: modZero && i > 0,
				  isLast: i === context.length - 1
				}));
			  }
			} else {
			  ret = inverse(this);
			}
			return ret;
		},
		showPrev: function(page, pages, options){
			console.log("page", page)
			console.log("pages", pages)
			if(page <= pages && page > 1){
				return `<div style="text-align:right;"><form method="GET" action=/api/blog/getpages/${page - 1}><button id="prevBtn" type="submit" class="btn btn-primary btn-sm">PREV</button></form></div>`
			}			
		},
		showNext: function(page, pages, options){
			if(page < pages){
				return `<div style="text-align:left;"><form method="GET" action=/api/blog/getpages/${page + 1}><button id="nextBtn" type="submit" class="btn btn-primary btn-sm">NEXT</button></form></div>`
			}

		}

  	}
});

// view engine setup
app.engine('handlebars', hbs.engine)
app.set('view engine', '.handlebars');
// Handlebars default config
const partialsDir = __dirname + '/views/partials';


// ******************************************************************************
// *** Express app setup
// ==============================================================================
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator())
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  	secret: process.env.SESSION_SECRET,
	resave: false,
	unset: 'destroy',
	saveUninitialized: false,
	store: new MongoStore({ 
		mongooseConnection: mongoose.connection,
		autoRemove: 'interval',
      	autoRemoveInterval: 20 // In minutes. Default
	}),	
  	// cookie: { 
		  
	// 	}
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
	res.locals.isAuthenticated = req.isAuthenticated();
	next()
});

//routes


require("./routes/html.js")(app);
require("./routes/api.js")(app);
require("./routes/blog.js")(app);
require('./passport/config.js')(passport, db.User);
var authRoute = require('./auth/auth.js')(app, passport);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});


app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});

