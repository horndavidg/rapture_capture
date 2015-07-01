  var db = require("../models");

var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

  ensureCorrectUser: function(req, res, next) {
    db.Place.findById(req.params.id, function(err,place){
      if (place.ownerId !== req.session.id) {
        res.redirect('/');
      }
      else {
       return next();
      }
    });
  },

  // Ensures the correct user for a specific Journal Entry....
  ensureCorrectUserE: function(req, res, next) {
   db.Entry.findById(req.params.id, function(err,entry){
      if (entry.ownerId !== req.session.id) {
        res.redirect('/');
      }
      else {
       return next();
      }
    });
  },


  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      res.redirect('/places');
    }
    else {
     return next();
    }
  }
};


module.exports = routeHelpers;