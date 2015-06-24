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
      console.log(err);
      console.log(user);
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


var currentuser;
// used for nav bar



//******************* PLACE ROUTES *************************//


// INDEX ROUTE (RESTRICTED TO LOGGED IN USER) //

app.get('/places', routeMiddleware.ensureLoggedIn, function(req,res){
db.Place.find({'ownerId':req.session.id}).populate('entries').populate('author')
    .exec(function(err,places){
  if(err) {
    console.log(err);
    res.render("errors/500");
} else {
      if(req.session.id === null){
        res.render('places/index', {places:places, currentuser:""});
      } else {
        db.User.findById(req.session.id, function(err,user){
          
          currentuser = user.username;
          // sets the current user variable to the current user that is loged in

          res.render('places/index', {places:places, currentuser:currentuser});
        });
      }
      }
  });
});








  // res.render("places/index", {currentuser:"", places:places});





// NEW ROUTE (RESTRICTED TO LOGGED IN USER) //

app.get('/places/new', routeMiddleware.ensureLoggedIn, function(req,res){
  var clear = "";
  res.render("places/new", {err:clear, currentuser:currentuser});
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
         res.render("places/edit", {place:place, currentuser:currentuser});
     });
});


// SHOW (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.get('/places/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Place.findById(req.params.id).populate('entries').exec(
    function (err, place) {
      if(err) {
        res.render("errors/404");
      } else {
        res.render("places/show", {place:place, currentuser:currentuser});
      } 
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


// INDEX (RESTRICTED TO LOGGED IN USER) - Simply shows all of 
// the Journal Entries for a given vacation.

app.get('/places/:place_id/entries', function(req,res){
  db.Place.findById(req.params.place_id).populate('entries').exec(function(err,place){
    res.render("entries/index", {place:place, currentuser:currentuser});
  });
});


// NEW ENTRY (RESTRICTED TO LOGGED IN USER) //

app.get('/places/:place_id/entries/new', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Place.findById(req.params.place_id,
    function (err, place) {
      res.render("entries/new", {place:place, err:err, currentuser:currentuser});
    });
});

// CREATE ENTRY (RESTRICTED TO LOGGED IN USER) //

app.post('/places/:place_id/entries', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Entry.create(req.body.entry, function(error, entries){
    if(error) {
      // console.log(err); 
    db.Place.findById(req.params.place_id,
    function (err, place) {
      res.render("entries/new", {place:place, err:error});
    });

            // TODO: Look at entering a custom error message!

    }
    
    else {
      
      db.Place.findById(req.params.place_id,function(err,place){
        if(err) {
          
          res.render("entries/new", {place:place, err:err});

           // TODO: Look at entering a custom error message!
              
        } else {

        place.entries.push(entries);
        entries.place = place._id;
        entries.ownerId = req.session.id;
        entries.save();
        place.save();
        console.log(entries);
        res.redirect("/places/"+ req.params.place_id +"/entries");
        }
      });
    }
  });
});


// EDIT ENTRY (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.get('/entries/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserE, 
  function(req,res){
  db.Entry.findById(req.params.id).populate('place').exec(function(err,entry){
      res.render("entries/edit", {entry:entry, err:err, currentuser:currentuser});
    });
});



// UPDATE ENTRY (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.put('/entries/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserE,
  function(req,res){
  db.Entry.findByIdAndUpdate(req.params.id, req.body.entry,
     function (err, entry) {
      // console.log("Comment!", comment);
       if(err) {
         res.render("entries/edit", {err:err, entry:entry});
       }
       else {
         res.redirect("/places/" + entry.place + "/entries");
       }
     });
});



// SHOW ** NOT USED ** (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.get('/entries/:id', function(req,res){
  db.Entry.findById(req.params.id)
    .populate('place')
    .exec(function(err,entry){
      res.render("entries/show", {entry:entry, currentuser:currentuser});
    });
});




// DESTROY (RESTRICTED TO SPECIFIC LOGGED IN USER) //

app.delete('/entries/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserE,
  function(req,res){
  db.Entry.findByIdAndRemove(req.params.id,
      function (err, entry) {
        if(err) {
          console.log(err);
          res.render("entries/edit");
        }
        else {
          res.redirect("/places/" + entry.place  + "/entries");
        }
      });
});






// ********************************************************


// CATCH ALL //
app.get('*', function(req,res){
  res.render('errors/404');
});

// START SERVER //
app.listen(3000, function(){
  console.log("Server is listening on Port: 3000");
});