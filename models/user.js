var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
      username: {
      type: String,
      lowercase: true,
      required: true,
      unique: true

    },

    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true

    },
    
    password: {
      type: String,
      required: true
    },
  });


// hook that runs before the user saves
userSchema.pre('save', function(next) {
  var user = this;
  // refers to the instance of the user

  if (!user.isModified('password')) {
    return next();
  }
// if password hasn't been modified move on and save user

  return bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }
    return bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      
// final step - user.password refers to whatever was passed through via a form.
      user.password = hash;
      return next();
    });
  });
});


// statics === CLASS METHODS

userSchema.statics.authenticate = function (formData, callback) {
  this.findOne({ // this = db.user
      // find an existing user with their e-mail.
      email: formData.email
    },
    // helper function
    function (err, user) {
      if (user === null){
        callback("Invalid username or password!",null);
        // dosen't give away too much information
      }
      else {
        user.checkPassword(formData.password, callback);
      }

    });
};


// INSTANCE METHOD //

userSchema.methods.checkPassword = function(password, callback) {
  var user = this;
  // this refers to the instance of the user
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (isMatch) {
      callback(null, user);
    } else {
      callback("Invalid username or password!", null);
    }
  });
};

var User = mongoose.model("User", userSchema);

module.exports = User;