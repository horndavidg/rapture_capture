var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
session = require("cookie-session"),
methodOverride = require('method-override'),
morgan = require("morgan"),
favicon = require('serve-favicon'),
loginMiddleware = require("./middleware/loginHelper");
routeMiddleware = require("./middleware/routeHelper");
require('dotenv').load();
var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;

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
// For use with Oauth
app.use(passport.initialize());
app.use(passport.session());


// passport.use(new FacebookStrategy({
//     clientID: process.env.FB_ID,
//     clientSecret: process.env.FB_SC,
//     callbackURL: "http://localhost:3000/auth/facebook/callback"},
//   function(accessToken, refreshToken, profile, done) {
//     console.log("1st>>>>>>>", profile);
//     db.User.findOne({'facebook':profile.id}, function(err, user) {
//       if (err) { return done(err); }
//       console.log("2nd>>>>>>>>>", user);

//       if (!user) {
        
//           var newuser = {
//           username: profile.displayName,
//           email: profile.profileUrl,
//           password: profile.id,
//           facebook: profile.id
//         };


//  db.User.create(newuser, function(err, user){
//     if(err) {console.log(err);}

                  
//                     // req.session.id = user._id;
//                     return done(err, user);
//            });      
//       } else {
       
//        return done(null, user);

//              }
//            });
//          }
//        ));
    

// Ability to have continuous sessions with Oauth

// passport.serializeUser(function(user, done) {
//   done(null, user);
// });

// passport.deserializeUser(function(user, done) {
//   done(null, user);
// });


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

app.get('/', routeMiddleware.preventLoginSignup, function(req,res){
  res.render("users");
});

// USER NEEDS TO SIGN UP! //

app.get('/signup', routeMiddleware.preventLoginSignup, function(req,res){
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
      
      var error = "Please GO BACK and make sure all the required fields are filled";
       // ERROR HANDLING - SEE VIEWS AND MODELS FILES
      res.render("users/signup", {err:error});

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


// // ROUTES FOR AUTH WITH FACEBOOK // *******************

// The initial route that a user is taken to via a link on the 
// index log in page....

// app.get('/auth/facebook', passport.authenticate('facebook'), function(req,res){
// });
// // Takes the user to FB to login-in
// app.get('/auth/facebook/callback', function(req, res, next) {

// console.log("THIS RAN");

//     passport.authenticate('facebook', function(err, user, info) {
      
//        if (err) { return next(err); }

//        if (!user) { return res.redirect('/login'); }

//        req.login(user, function(err) {
      
//       if (err) { return next(err); }
      
//       return res.redirect('/places');
//     });
//   });
// });


// *****************************************************

  // passport.authenticate('facebook', { failureRedirect: '/login' }),
  // function(req, res, user) {
  //     req.login(user);
  //     res.redirect("/places");
  // });
// If log in is successful takes the user to places index or if they
// fail redirects them to the login page







// LOGS OUT USER! //

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});


var currentuser;
// used for nav bar

//******************* SHOW SEARCH ROUTES *************************//


var local;

// GET SHOW PAGE ROUTE //

app.get('/show', routeMiddleware.ensureLoggedIn, function(req,res){
      if(err) {
        res.render("errors/404");
      } else {
        res.render("show", {place:local, currentuser:currentuser});
      } 
   });


////////////// POST TO SHOW PAGE ROUTE //////////////


app.post('/show', function(req,res){

 var loc = req.body.location;
 var key = process.env.EX_KEY;


if (req.body.location !== "") {


request.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + 
      req.body.location, function (error, response, body) {


          if (error) {
    
          console.log("Error!  Request failed - " + error);
              res.render("errors/500");
  
          } else if (!error && response.statusCode === 200) {

                    var info = JSON.parse(body);  

                      if (info.status === 'ZERO_RESULTS') {
                          // The location entered by the user 
                          // could not be found by Google

                        res.render('errors/404');

                    } else {
                      
          lat = info.results[0].geometry.location.lat;
          lng = info.results[0].geometry.location.lng;
        
          var local = {location:loc, lat:lat, long:lng};

request.get("http://api.openweathermap.org/data/2.5/weather?q=" + 
      req.body.location + "&units=imperial", function (error, response, body) {

          if (error) {
    
          console.log("Error!  Request failed - " + error);
              res.render("errors/500");
  
          } else if (!error && response.statusCode === 200) {

                    var weather = JSON.parse(body); 
                    // Brings in basic weather information for the 
                    // user given search area...
                        
                        if (weather.cod === '404') {
                            // Error handling for if the weather API is unable to locate the location entered by 
                            // the user.

                                weather = {main: {temp:"0", humidity:"0"}, weather: [{description:"Not Available"}, 
                                            {description:"Not Available"}]};

                                 res.format({
           
                                'text/html': function(){
                                      // res.redirect("/show");
                                      res.render('show', {place:local, currentuser:currentuser, weather:weather, key:key});
                                    },
     
                                  'application/json': function(){
                                        res.send({place:local});
                                    },
                                  'default': function() {
                                  
                                    res.status(406).send('Not Acceptable');

                                        }
                                     });


                        } else {


          res.format({
           
            'text/html': function(){
                  // res.redirect("/show");
                  res.render('show', {place:local, currentuser:currentuser, weather:weather, key:key});
                },
     
              'application/json': function(){
                    res.send({place:local});
                },
              'default': function() {
              
                res.status(406).send('Not Acceptable');

                    }
                 });
                 }
                }
               }); 
             }
          }
        });

} else if (req.body.location === "") {


request.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + req.body.lat + "," + req.body.long, function (error, response, body) {

          if (error) {
    
              console.log("Error!  Request failed - " + error);
              res.render("errors/500");
  
          } else if (!error && response.statusCode === 200) {

                var info = JSON.parse(body);        

              if (info.status === 'ZERO_RESULTS') {

                // Error handling when the user clicks on a location 
                // on the map that can't be found  

              var notfound = {location:"Not Found", lat:"Not Found", long:"Not Found"};
              
              weather = {main: {temp:"0", humidity:"0"}, weather: [{description:"Not Available"}, 
                                            {description:"Not Available"}]};

                      // Adding not found weather information in case the user submits the search 
                      // form with entering anything....

                        res.format({
                          
                          'text/html': function(){
                               res.render('show', {place:notfound, weather:weather, currentuser:currentuser, key:key});
                              },
     
                            'application/json': function(){
                                  res.send({place:notfound});
                              },
                            'default': function() {
                            
                              res.status(406).send('Not Acceptable');

                                  }
                               });

                      } else {

                          // If the geolocation from the map is found then this code
                          // will run....

                              lat = info.results[0].geometry.location.lat;
                              lng = info.results[0].geometry.location.lng;
                              loc = info.results[0].formatted_address;
                 
                              var local = {location:loc, lat:lat, long:lng};
                    
                              res.format({
                                
                                'text/html': function(){
                                     res.render('show', {place:local, currentuser:currentuser, key:key});
                                 },
                      
                               'application/json': function(){
                                     res.send({place:local});
                                 },
                               'default': function() {
                               
                                 res.status(406).send('Not Acceptable');
                 
                                     }
                                  }); 
                              }
                            }
                          });
                          }
                        });



//******************* PLACE ROUTES *************************//


// INDEX ROUTE (RESTRICTED TO LOGGED IN USER) //

app.get('/places', routeMiddleware.ensureLoggedIn, function(req,res){
 
db.Place.find({'ownerId':req.session.id}).populate('entries').populate('author')
    .exec(function(err,places){
  if(err) {
    console.log(err);
    res.render("errors/500");
} else {
      // console.log(req.session.id);
      if(req.session.id === null){
        res.redirect('/');
      } else {
        console.log(req.body);
        db.User.findById(req.session.id, function(err,user){
          currentuser = user.username;
          // sets the current user variable to the current user that is loged in
        res.format({
           'text/html': function(){
            res.render("places/index", {places:places, currentuser:currentuser});
              },
          'application/json': function(){
          res.send({places:places,currentuser:currentuser});
            },
         'default': function() {
          // log the request and respond with 406
          res.status(406).send('Not Acceptable');
                  }
             });
        });
      }
      }
  });
});



// NEW ROUTE (RESTRICTED TO LOGGED IN USER) ///////////

app.get('/places/new', routeMiddleware.ensureLoggedIn, function(req,res){
  var err = " ";
  var UC_KEY = process.env.UC_KEY;
   // Brings in Upload Care Key
  res.render("places/new", {err:err, currentuser:currentuser, UC_KEY:UC_KEY});
});



//////// CREATE (RESTRICTED TO LOGGED IN USER) ////////

// Functionality to search for and find lat and long
// for a given location whether the user enters it or
// searchs for it (allows for map placement)

app.post('/places', routeMiddleware.ensureLoggedIn, function(req,res){
  
  request.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + 
       req.body.place.location, function (error, response, body) {

if (error) {
    
          console.log("Error!  Request failed - " + error);
          res.render("errors/500");
  
} else if (!error && response.statusCode === 200) {
          
           var info = JSON.parse(body);
          
           if (info.status === 'ZERO_RESULTS') {
                    var lost = new db.Place(req.body.place);

                    lost.ownerId = req.session.id;
                    lost.save(function(err,place){
       
                  if(err) {
                      error = "Please GO BACK and make sure all the required fields are filled";
                      console.log(err);
                      res.render("places/new", {err:error, currentuser:currentuser});
                    } else {
                        res.redirect("/places"); 
                   }
                 });

           } else {

           lat = info.results[0].geometry.location.lat;
           lng = info.results[0].geometry.location.lng;

           var place = new db.Place(req.body.place);

           place.ownerId = req.session.id;
           place.lat = lat;
           place.long = lng;
           place.save(function(err,place){
       
                  if(err) {
                      error = "Please GO BACK and make sure all the required fields are filled";
                      console.log(err);
                      res.render("places/new", {err:error, currentuser:currentuser});
                    } else {
                        res.redirect("/places"); 
                   }
              });
            }
            }    
        });
      });

// WORKING SIMPLE VERSION //
// app.post('/places', routeMiddleware.ensureLoggedIn, function(req,res){
//   var place = new db.Place(req.body.place);
//     place.ownerId = req.session.id;
//     console.log("PLACE", place);
//     place.save(function(err,place){
//        if(err) {
//         error = "Please GO BACK and make sure all the required fields are filled";
//         console.log(err);
//         res.render("places/new", {err:error, currentuser:currentuser});
//       } else {
//         res.redirect("/places"); 
//       }
     
//     });
// });


// EDIT (RESTRICTED TO SPECIFIC LOGGED IN USER) /////////////////

app.get('/places/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, function(req,res){
  var UC_KEY = process.env.UC_KEY;
  // Brings in Upload Care Key
  db.Place.findById(req.params.id).populate('entries').exec(
     function (err, place) {
         res.render("places/edit", {place:place, currentuser:currentuser, UC_KEY:UC_KEY});
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
  var UC_KEY = process.env.UC_KEY;
   // Brings in Upload Care Key
  db.Place.findById(req.params.place_id,
    function (err, place) {
      res.render("entries/new", {place:place, err:err, currentuser:currentuser, UC_KEY:UC_KEY});
    });
});

// CREATE ENTRY (RESTRICTED TO LOGGED IN USER) //

app.post('/places/:place_id/entries', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Entry.create(req.body.entry, function(error, entries){
    if(error) {
      error = "Please GO BACK and make sure all the required fields are filled";
    db.Place.findById(req.params.place_id,
    function (err, place) {
      res.render("entries/new", {place:place, err:error, currentuser:currentuser});
    });

    }
    
    else {
      
      db.Place.findById(req.params.place_id,function(err,place){
        if(err) {
          
          res.render("entries/new", {place:place, err:err, currentuser:currentuser});
              
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
     var UC_KEY = process.env.UC_KEY;
   // Brings in Upload Care Key
  db.Entry.findById(req.params.id).populate('place').exec(function(err,entry){
      res.render("entries/edit", {entry:entry, err:err, currentuser:currentuser, UC_KEY:UC_KEY});
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



// SHOW (RESTRICTED TO SPECIFIC LOGGED IN USER) //

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
app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening on Port: 3000");
});