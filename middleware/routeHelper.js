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

  // May require a second ensureCorrectUser depending on how many
  // resources we are validating...


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