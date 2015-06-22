var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
session = require("cookie-session"),
methodOverride = require('method-override'),
morgan = require("morgan"),
favicon = require('serve-favicon'),
loginMiddleware = require("./middleware/loginHelper");
routeMiddleware = require("./middleware/routeHelper");
 
var request = require('request');

var db = require("./models");


// MIDDLEWARE // ****************************************

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(loginMiddleware);

app.use(session({
  maxAge: 3600000,
  // sets timeout
  secret: 'dubcitywins',
  // how the session decrypts the cookie
  name: "chocolate chips"
  // (cookie specific)
}));

//******************* PLACE ROUTES *************************//


// ROOT (PUBLIC) //

app.get('/', function(req,res){
  res.render("users");
});













































// CATCH ALL //
app.get('*', function(req,res){
  res.render('errors/404');
});

// START SERVER //
app.listen(3000, function(){
  console.log("Server is listening on Port: 3000");
});