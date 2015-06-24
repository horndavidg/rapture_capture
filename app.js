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

//******************* USER ROUTES *************************//


// ROOT (PUBLIC) //

app.get('/', function(req,res){
  res.render("users");
});

// USER NEEDS TO SIGN UP! //

app.get('/signup', routeMiddleware.preventLoginSignup ,function(req,res){
    var clear = "";
    res.render("users/signup", {err:clear});
    // added clean err var to render page
});

// USER SUBMITTS SIGN UP FORM! // 

app.post("/signup", function (req,res) {
  var newUser = req.body.user;
  db.User.create(newUser, function (err, user) {
    if (user) {
      req.login(user);
      res.redirect("/places");
    } else if (err){
      
       // ERROR HANDLING - SEE VIEWS AND MODELS FILES
      res.render("users/signup", {err:err});

   }
  });
});

// DIRECTED TO THE LOGIN PAGE //

app.get("/login", routeMiddleware.preventLoginSignup, function (req, res) {
  var clear = "";
  res.render("users/login", {err:clear});
});

// USER SUBMITTS LOGIN FORM! //

app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (!err && user !== null) {
      req.login(user);
      res.redirect("/places");
    } else {
      
      // ERROR HANDLING - SEE VIEWS AND MODELS FILES
      res.render("users/login", {err:err});
    }
  });
});


// LOGS OUT USER! //

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});






//******************* PLACE ROUTES *************************//


// INDEX ROUTE (RESTRICTED TO LOGGED IN USER) //

app.get('/places', routeMiddleware.ensureLoggedIn, function(req,res){
db.Place.find({}, function(err,places){
  if(err) {
    console.log(err);
    res.render("errors/500");
} else {
  res.render("places/index", {currentuser:"", places:places});
      }
  });
});


// NEW ROUTE (RESTRICTED TO LOGGED IN USER) //

app.get('/places/new', routeMiddleware.ensureLoggedIn, function(req,res){
  res.render("places/new");
});




// CREATE (RESTRICTED TO LOGGED IN USER) //

app.post('/places', routeMiddleware.ensureLoggedIn, function(req,res){
  var place = new db.Place(req.body.place);
    place.ownerId = req.session.id;
    place.save(function(err,place){
      // console.log(place);
      res.redirect("/places");
    });
});



// EDIT (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.get('/places/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, function(req,res){
  db.Place.findById(req.params.id).populate('entries').exec(
     function (err, place) {
         res.render("places/edit", {place:place});
     });
});


// SHOW (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.get('/places/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Place.findById(req.params.id).populate('entries').exec(
    function (err, place) {
        res.render("places/show", {place:place});
    });
});


// UPDATE (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.put('/places/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, function(req,res){
 db.Place.findByIdAndUpdate(req.params.id, req.body.place,
     function (err, place) {
       if(err) {
         res.render("places/edit");
       }
       else {
         res.redirect("/places");
       }
     });
});



// DESTROY (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.delete('/places/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, 
  function(req,res){
  db.Place.findById(req.params.id,
    function (err, place) {
      if(err) {
        console.log(err);
        res.render("places/show");
      }
      else {
        place.remove();
        res.redirect("/places");
      }
    });
});




//******************* ENTRY ROUTES ***********************//


// INDEX (RESTRICTED TO LOGGED IN USER) //

// Not sure if I'm going to need an index page for Journal Entries 
// at this point!


// NEW (RESTRICTED TO LOGGED IN USER) //

app.get('/places/:place_id/entries/new', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Place.findById(req.params.place_id,
    function (err, place) {
      res.render("entries/new", {place:place});
    });
});














// CATCH ALL //
app.get('*', function(req,res){
  res.render('errors/404');
});

// START SERVER //
app.listen(3000, function(){
  console.log("Server is listening on Port: 3000");
});